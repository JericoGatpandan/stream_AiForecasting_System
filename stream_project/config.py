from dataclasses import dataclass, field
from typing import Dict, List, Tuple, Optional, Union


@dataclass
class ModelParameters:
    """
    Configuration class for model parameters with validation.
   
    Physical Interpretation:
    - CN: Soil Conservation Service Curve Number (dimensionless)
    - area_km2: Catchment area in square kilometers
    - lorenz_params: Physically motivated chaos parameters
    """
    # Hydrological parameters
    CN: float = 78.0  # SCS Curve Number
    lambda_ia: float = 0.2  # Initial abstraction coefficient
    area_km2: float = 84.48  # Catchment area (Naga City watershed)
   
    # Unit hydrograph parameters
    t_peak_hours: float = 4.0  # Time to peak
    t_base_hours: float = 18.0  # Base time
   
    # Storm parameters
    peak_mm_hr: float = 45.0  # Peak rainfall intensity
    peak_time: float = 10.0   # Time of peak rainfall
    decay_rate: float = 8.0   # Exponential decay parameter
   
    # Physically-motivated Lorenz parameters
    lorenz_params: Dict[str, float] = field(default_factory=lambda: {
        "sigma": 10.0,      # Energy dissipation rate (1/time)
        "rho": 28.0,        # Rayleigh number (dimensionless)
        "beta": 8.0/3.0,    # Geometric factor (dimensionless)
        "gamma": 0.015,     # Hydrological forcing strength
        "kappa": 0.12,      # Storage decay rate (1/time)
        "mu": 0.008,        # Channel-groundwater coupling
        "alpha": 0.25,      # Energy transfer efficiency
    })
   
    # SMC parameters
    n_particles: int = 1000
    resampling_threshold: float = 0.5  # Effective sample size threshold
   
    # Observation parameters
    obs_error_base: float = 0.15  # Base observation error (fraction)
    obs_error_min: float = 0.05   # Minimum observation error
   
    def __post_init__(self):
        """Validate parameters after initialization."""
        self.validate()
   
    def validate(self) -> None:
        """Comprehensive parameter validation with physical constraints."""
        if not (30 <= self.CN <= 100):
            raise ValueError(f"CN must be between 30-100, got {self.CN}")
        if self.area_km2 <= 0:
            raise ValueError(f"Catchment area must be positive, got {self.area_km2}")
        if self.peak_mm_hr <= 0:
            raise ValueError(f"Peak rainfall must be positive, got {self.peak_mm_hr}")
        if not (0 < self.lambda_ia < 1):
            raise ValueError(f"Initial abstraction coefficient must be in (0,1), got {self.lambda_ia}")
       
        # Validate Lorenz parameters for stability
        lorenz = self.lorenz_params
        if lorenz["sigma"] <= 0 or lorenz["beta"] <= 0:
            raise ValueError("Lorenz stability parameters must be positive")
        if not (0 < lorenz["gamma"] < 0.1):
            raise ValueError(f"Hydrological forcing strength out of range: {lorenz['gamma']}")