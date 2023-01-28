# Planscape

## Introduction
**[Planscape](https://www.planscape.org/)** is a new wildfire resilience planning tool, bringing the
best available state and federal data and science together to help regional planners prioritize landscape
treatments for mitigating fire risk, maximizing ecological benefits and helping California’s
landscapes adapt to climate change.

Please see our [wiki](https://github.com/OurPlanscape/Planscape/wiki) for more information.

## Features
Some of the things you can do in Planscape (WIP):

- Visualize the Regional Resource Kit data layers
- Highlight areas with best management potential  
- Generate project plans
- Share and combine plans with collaborators

## Set Up
See the [Development getting started](https://github.com/OurPlanscape/Planscape/wiki/Development-getting-started) guide
for how to download, build, and test Planscape.

## Built With

- [PostGIS](https://postgis.net/) - database for storing user sessions and plans
- [ESRI](https://www.esri.com/en-us/home) - GIS mapping software, web GIS and geodatabase management applications
- [Django REST framework](https://www.django-rest-framework.org/) - backend framework
- [Angular](https://angular.io/) - frontend framework
- [Leaflet](https://leafletjs.com/) - used to display maps and layers
- [ForSYS](https://www.fs.usda.gov/rmrs/projects/forsys-scenario-planning-model-multi-objective-restoration-and-fuel-management-planning) - linear optimization software package for choosing the best project area for treatment
- [PROMOTe](https://www.fs.usda.gov/psw/topics/restoration/tcsi/publications/TCSI-Blueprint.pdf) - used to compute conditions from basic data, and find new optimal areas for treatment

## Contributing

See [CONTRIBUTING](CONTRIBUTING.md) for additional information.

## Public domain

This project is in the worldwide [public domain](LICENSE.md). As stated in [CONTRIBUTING](CONTRIBUTING.md):

> This project is in the public domain within the United States, and copyright and related rights in the work worldwide are waived through the [CC0 1.0 Universal public domain dedication](https://creativecommons.org/publicdomain/zero/1.0/).
>
> All contributions to this project will be released under the CC0 dedication. By submitting a pull request, you are agreeing to comply with this waiver of copyright interest.
