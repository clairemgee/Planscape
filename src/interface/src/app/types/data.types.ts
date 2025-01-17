import { NONE_COLORMAP } from './legend.types';

export interface BoundaryConfig {
  display_name?: string;
  boundary_name: string;
}

export interface ConditionsConfig extends DataLayerConfig {
  region_name?: string;
  pillars?: PillarConfig[];
}

export interface ConditionsMetadata {
  data_download_link?: string;
  data_provider?: string;
  data_year?: string;
  reference_link?: string;
  source?: string;
  source_link?: string;
  min_value?: number;
  max_value?: number;
}

export interface DataLayerConfig extends ConditionsMetadata {
  display_name?: string;
  filepath?: string;
  colormap?: string;
  normalized?: boolean;
  opacity?: number;
}

export interface ElementConfig extends DataLayerConfig {
  element_name?: string;
  metrics?: MetricConfig[];
}

export interface MetricConfig extends DataLayerConfig {
  metric_name: string;
  data_units?: string;
}

export interface PillarConfig extends DataLayerConfig {
  display?: boolean;
  pillar_name?: string;
  elements?: ElementConfig[];
}

export const NONE_BOUNDARY_CONFIG: BoundaryConfig = {
  boundary_name: '',
  display_name: 'None',
};

export const NONE_DATA_LAYER_CONFIG: DataLayerConfig = {
  display_name: 'None',
  filepath: '',
  colormap: NONE_COLORMAP,
};
