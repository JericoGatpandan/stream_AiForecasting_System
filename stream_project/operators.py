import numpy as np
from typing import Optional, Dict

def physical_observation_operator(states: np.ndarray,
                                base_discharge: np.ndarray,
                                observation_params: Optional[Dict] = None) -> np.ndarray:
    """
    Physically-motivated observation operator linking chaos states to observables.
   
    Mathematical formulation:
    Q_obs(t) = Q_base(t) * [1 + α₁*tanh(w(t)) + α₂*sigmoid(y(t)) + α₃*x(t)]
   
    Physical interpretation:
    - Base discharge modified by:
      - Groundwater contribution: α₁*tanh(w)
      - Energy dissipation effect: α₂*sigmoid(y)  
      - Direct discharge anomaly: α₃*x
   
    Args:
        states: State matrix (4 x n_times)
        base_discharge: Base hydrological discharge
        observation_params: Parameters for observation operator
       
    Returns:
        Observable discharge time series
    """
    if observation_params is None:
        observation_params = {
            "alpha1": 0.25,  # Groundwater contribution strength
            "alpha2": 0.15,  # Energy dissipation effect
            "alpha3": 0.10,  # Direct anomaly contribution
            "beta": 2.0      # Sigmoid steepness
        }
   
    x, y, z, w = states[0, :], states[1, :], states[2, :], states[3, :]
   
    # Physical components
    groundwater_contrib = observation_params["alpha1"] * np.tanh(w)
    energy_effect = observation_params["alpha2"] * (2 / (1 + np.exp(-observation_params["beta"] * y)) - 1)
    direct_anomaly = observation_params["alpha3"] * np.tanh(x)
   
    # Combined observation
    multiplicative_factor = 1.0 + groundwater_contrib + energy_effect + direct_anomaly
   
    # Ensure physical realizability (discharge must be non-negative)
    multiplicative_factor = np.maximum(multiplicative_factor, 0.1)
   
    return base_discharge * multiplicative_factor