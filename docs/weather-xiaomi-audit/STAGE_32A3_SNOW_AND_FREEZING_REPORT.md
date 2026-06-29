# Stage 32A.3 Snow and Freezing Report

Snow and freezing states were calibrated through existing snow, ice, and frost assets plus fixed-pool particles.

## Snow

Snow states are differentiated by:

- snow sheet opacity;
- near-particle count;
- particle scale;
- fall speed;
- frost haze strength.

Covered groups:

- light snow
- moderate snow
- heavy snow
- snow grains
- snow showers

## Freezing and Sleet

Freezing drizzle, freezing rain, rime fog, and sleet now share a frost/rime edge layer where appropriate while keeping condition-specific precipitation composition.

Covered groups:

- rime fog
- freezing drizzle
- freezing rain
- sleet/freezing mix

The implementation does not copy upstream animation configuration and does not add a separate renderer.
