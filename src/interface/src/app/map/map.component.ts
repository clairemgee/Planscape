import {
  AfterViewInit,
  ApplicationRef,
  Component,
  createComponent,
  EnvironmentInjector,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { BehaviorSubject, Observable, Subject, take, takeUntil } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import {
  MapService,
  PlanService,
  PlanState,
  PopupService,
  SessionService,
} from '../services';
import {
  BaseLayerType,
  BoundaryConfig,
  ConditionsConfig,
  defaultMapConfig,
  Map,
  MapConfig,
  MapViewOptions,
  Region,
} from '../types';
import { Legend } from './../shared/legend/legend.component';
import { MapManager } from './map-manager';
import { PlanCreateDialogComponent } from './plan-create-dialog/plan-create-dialog.component';
import { ProjectCardComponent } from './project-card/project-card.component';

export interface PlanCreationOption {
  value: string;
  display: string;
  icon: any;
}

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
})
export class MapComponent implements AfterViewInit, OnDestroy, OnInit {
  mapManager: MapManager;

  maps: Map[];
  mapViewOptions: MapViewOptions = {
    selectedMapIndex: 0,
    numVisibleMaps: 2,
  };

  boundaryConfig$: Observable<BoundaryConfig[] | null>;
  conditionsConfig$: Observable<ConditionsConfig | null>;
  selectedRegion$: Observable<Region | null>;
  planState$: Observable<PlanState>;

  baseLayerTypes: number[] = [BaseLayerType.Road, BaseLayerType.Terrain];
  BaseLayerType: typeof BaseLayerType = BaseLayerType;

  existingProjectsGeoJson$ = new BehaviorSubject<GeoJSON.GeoJSON | null>(null);

  loadingIndicators: { [layerName: string]: boolean } = {
    'existing_projects': true
  };

  legend: Legend = {
    labels: [
      'Highest',
      'Higher',
      'High',
      'Mid-high',
      'Mid-low',
      'Low',
      'Lower',
      'Lowest',
    ],
    colors: [
      '#f65345',
      '#e9884f',
      '#e5ab64',
      '#e6c67a',
      '#cccfa7',
      '#a5c5a6',
      '#74afa5',
      '#508295',
    ],
  };

  planCreationOptions: PlanCreationOption[] = [
    { value: 'draw-area', icon: 'edit', display: 'Draw an area' },
  ];
  selectedPlanCreationOption: PlanCreationOption | null = null;
  showCreatePlanButton: boolean = false;

  private readonly destroy$ = new Subject<void>();

  constructor(
    public applicationRef: ApplicationRef,
    private mapService: MapService,
    private dialog: MatDialog,
    private environmentInjector: EnvironmentInjector,
    private popupService: PopupService,
    private sessionService: SessionService,
    private planService: PlanService
  ) {
    this.boundaryConfig$ = this.mapService.boundaryConfig$.pipe(
      takeUntil(this.destroy$)
    );
    this.conditionsConfig$ = this.mapService.conditionsConfig$.pipe(
      takeUntil(this.destroy$)
    );
    this.selectedRegion$ = this.sessionService.region$.pipe(
      takeUntil(this.destroy$)
    );
    this.planState$ = this.planService.planState$.pipe(
      takeUntil(this.destroy$)
    );

    this.mapService
      .getExistingProjects()
      .pipe(takeUntil(this.destroy$))
      .subscribe((projects: GeoJSON.GeoJSON) => {
        this.existingProjectsGeoJson$.next(projects);
        this.loadingIndicators['existing_projects'] = false;
      });

    this.maps = ['map1', 'map2', 'map3', 'map4'].map(
      (id: string, index: number) => {
        return {
          id: id,
          name: 'Map ' + (index + 1),
          config: defaultMapConfig(),
        };
      }
    );

    this.mapManager = new MapManager(
      this.maps,
      popupService,
      this.startLoadingLayerCallback.bind(this),
      this.doneLoadingLayerCallback.bind(this)
    );
  }

  ngOnInit(): void {
    this.restoreSession();
    /** Save map configurations in the user's session every X ms. */
    this.sessionService.sessionInterval$
      .pipe(takeUntil(this.destroy$))
      .subscribe((_) => {
        this.sessionService.setMapViewOptions(this.mapViewOptions);
        this.sessionService.setMapConfigs(
          this.maps.map((map: Map) => map.config)
        );
      });
  }

  ngAfterViewInit(): void {
    this.maps.forEach((map: Map) => {
      this.initMap(map, map.id);
    });

    this.mapManager.syncAllMaps();
    this.mapManager.addDrawingControls(
      this.maps[0].instance!,
      this.onDrawCreatedCallback.bind(this),
      this.onDrawDeletedCallback.bind(this)
    );
  }

  ngOnDestroy(): void {
    this.maps.forEach((map: Map) => map.instance?.remove());
    this.sessionService.setMapConfigs(this.maps.map((map: Map) => map.config));
    this.destroy$.next();
    this.destroy$.complete();
  }

  private onDrawCreatedCallback() {
    this.showCreatePlanButton = true;
  }

  private onDrawDeletedCallback() {
    this.showCreatePlanButton = false;
  }

  private restoreSession() {
    this.sessionService.mapViewOptions$
      .pipe(take(1))
      .subscribe((mapViewOptions: MapViewOptions | null) => {
        if (mapViewOptions) {
          this.mapViewOptions = mapViewOptions;
        }
      });
    this.sessionService.mapConfigs$
      .pipe(take(1))
      .subscribe((mapConfigs: MapConfig[] | null) => {
        if (mapConfigs) {
          mapConfigs.forEach((mapConfig, index) => {
            this.maps[index].config = mapConfig;
          });
        }
      });
  }

  /** Initializes the map with controls and the layer options specified in its config. */
  private initMap(map: Map, id: string) {
    this.mapManager.initLeafletMap(
      map,
      id,
      this.existingProjectsGeoJson$,
      (feature) => {
        let component = createComponent(ProjectCardComponent, {
          environmentInjector: this.environmentInjector,
        });
        component.instance.feature = feature;
        this.applicationRef.attachView(component.hostView);
        return component.location.nativeElement;
      },
      this.getBoundaryLayerGeoJson.bind(this)
    );

    // Renders the selected region on the map.
    this.selectedRegion$.subscribe((selectedRegion: Region | null) => {
      this.displayRegionBoundary(map, selectedRegion);
    });

    // Mark the map as selected when the user clicks anywhere on it.
    map.instance?.addEventListener('click', () => {
      this.mapViewOptions.selectedMapIndex = this.maps.indexOf(map);
      this.sessionService.setMapViewOptions(this.mapViewOptions);
    });
  }

  private startLoadingLayerCallback(layerName: string) {
    this.loadingIndicators[layerName] = true;
  }
  private doneLoadingLayerCallback(layerName: string) {
    this.loadingIndicators[layerName] = false;
  }

  private getBoundaryLayerGeoJson(
    boundaryName: string
  ): Observable<GeoJSON.GeoJSON> {
    return this.selectedRegion$.pipe(
      switchMap((region) =>
        this.mapService.getBoundaryShapes(boundaryName, region)
      )
    );
  }

  /** Configures and opens the Create Plan dialog */
  openCreatePlanDialog() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.maxWidth = '560px';

    const openedDialog = this.dialog.open(
      PlanCreateDialogComponent,
      dialogConfig
    );

    openedDialog.afterClosed().subscribe((result) => {
      if (result) {
        this.createPlan(result.value, this.mapManager.convertToPlanningArea());
      }
    });
  }

  private createPlan(name: string, shape: GeoJSON.GeoJSON) {
    this.selectedRegion$.subscribe((selectedRegion) => {
      if (!selectedRegion) return;

      this.planService
        .createPlan({
          name: name,
          ownerId: 'tempUserId',
          region: selectedRegion,
          planningArea: shape,
        })
        .subscribe((result) => {
          console.log(result);
        });
    });
  }

  /**
   * On PlanCreationOptions selection change, enables the polygon tool if
   * the drawing option is selected.
   */
  onPlanCreationOptionChange(option: PlanCreationOption) {
    if (option.value === 'draw-area') {
      this.mapManager.enablePolygonDrawingTool(this.maps[0].instance!);
    }
  }

  /** Gets the selected region geojson and renders it on the map. */
  private displayRegionBoundary(map: Map, selectedRegion: Region | null) {
    if (!selectedRegion) return;
    if (!map.instance) return;
    this.mapService
      .getRegionBoundary(selectedRegion)
      .subscribe((boundary: GeoJSON.GeoJSON) => {
        this.mapManager.maskOutsideRegion(map.instance!, boundary);
      });
  }

  /** Toggles which base layer is shown. */
  changeBaseLayer(map: Map) {
    this.mapManager.changeBaseLayer(map);
  }

  /** Toggles which boundary layer is shown. */
  toggleBoundaryLayer(map: Map) {
    this.mapManager.toggleBoundaryLayer(
      map,
      this.getBoundaryLayerGeoJson.bind(this)
    );
  }

  /** Toggles whether existing projects from CalMapper are shown. */
  toggleExistingProjectsLayer(map: Map) {
    this.mapManager.toggleExistingProjectsLayer(map);
  }

  /** Changes which condition scores layer (if any) is shown. */
  changeConditionsLayer(map: Map) {
    this.mapManager.changeConditionsLayer(map);
  }

  /* Change how many maps are displayed in the viewport. */
  changeMapCount(mapCount: number) {
    this.mapViewOptions.numVisibleMaps = mapCount;
    setTimeout(() => {
      this.maps.forEach((map: Map) => map.instance?.invalidateSize());
    }, 0);
  }

  /** Whether the map at given index should be visible.
   *
   *  WARNING: This function is run constantly and shouldn't do any heavy lifting!
   */
  isMapVisible(index: number): boolean {
    if (index === this.mapViewOptions.selectedMapIndex) return true;

    switch (this.mapViewOptions.numVisibleMaps) {
      case 4:
        return true;
      case 1:
        // Only 1 map is visible and this one is not selected
        return false;
      case 2:
      default:
        // In 2 map view, only the 1st and 2nd map are shown regardless of selection
        if (index === 0 || index === 1) {
          // TODO: 2 map view might go away or the logic here might change
          return true;
        }
        return false;
    }
  }

  /** Computes the height for the map row at given index (0%, 50%, or 100%).
   *
   *  WARNING: This function is run constantly and shouldn't do any heavy lifting!
   */
  mapRowHeight(index: number): string {
    switch (this.mapViewOptions.numVisibleMaps) {
      case 4:
        return '50%';
      case 2:
        // In 2 map view, only the 1st and 2nd map are shown regardless of selection
        // TODO: 2 map view might go away or the logic here might change
        return index === 0 ? '100%' : '0%';
      case 1:
      default:
        if (Math.floor(this.mapViewOptions.selectedMapIndex / 2) === index) {
          return '100%';
        }
        return '0%';
    }
  }
}
