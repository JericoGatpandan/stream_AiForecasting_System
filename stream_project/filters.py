import numpy as np
from typing import List, Dict, Tuple, Optional, Union
from .logger import logger
from scipy.stats import qmc




class EnhancedParticleFilter:
    """
    Enhanced Sequential Monte Carlo implementation with adaptive resampling
    and parameter estimation.
    """
   
    def __init__(self,
                 n_particles: int,
                 param_bounds: Dict[str, Tuple[float, float]],
                 resampling_threshold: float = 0.5,
                 adaptive_inflation: bool = True,
                 seed: Optional[int] = None):
        """
        Initialize the particle filter.
       
        Args:
            n_particles: Number of particles
            param_bounds: Parameter bounds dictionary
            resampling_threshold: ESS threshold for resampling
            adaptive_inflation: Whether to use adaptive parameter inflation
            seed: Random seed for reproducibility
        """
        self.n_particles = n_particles
        self.param_bounds = param_bounds
        self.resampling_threshold = resampling_threshold
        self.adaptive_inflation = adaptive_inflation
        self.seed = seed
       
        # Initialize random number generator
        self.rng = np.random.default_rng(seed)
       
        # Initialize particles
        self.particles = self._initialize_particles()
       
        # Diagnostics
        self.ess_history = []
        self.weight_history = []
        self.parameter_evolution = {key: [] for key in param_bounds.keys()}
       
        logger.info(f"Initialized particle filter with {n_particles} particles")
   
    def _initialize_particles(self) -> List[Dict]:
        """Initialize particle ensemble using Latin Hypercube Sampling."""
        keys = list(self.param_bounds.keys())
        n_dims = len(keys)
       
        # Latin Hypercube sampling
        sampler = qmc.LatinHypercube(d=n_dims, seed=self.seed)
        samples = sampler.random(self.n_particles)
       
        # Scale to parameter bounds
        l_bounds = np.array([self.param_bounds[k][0] for k in keys])
        u_bounds = np.array([self.param_bounds[k][1] for k in keys])
        scaled_samples = qmc.scale(samples, l_bounds, u_bounds)
       
        particles = []
        for i, sample in enumerate(scaled_samples):
            particle = {
                "id": i,
                "weight": 1.0 / self.n_particles,
                "log_weight": -np.log(self.n_particles),
                "parameters": {},
                "state": None,
                "likelihood": 0.0
            }
           
            # Assign parameters
            for j, key in enumerate(keys):
                particle["parameters"][key] = sample[j]
           
            # Initialize state based on parameters
            if all(k in keys for k in ["y0_x", "y0_y", "y0_z", "y0_w"]):
                particle["state"] = np.array([
                    particle["parameters"]["y0_x"],
                    particle["parameters"]["y0_y"],
                    particle["parameters"]["y0_z"],
                    particle["parameters"]["y0_w"]
                ])
            else:
                particle["state"] = np.array([0.0, 1.0, 20.0, 0.0])  # Default
           
            particles.append(particle)
       
        return particles
   
    def effective_sample_size(self) -> float:
        """Calculate effective sample size."""
        weights = np.array([p["weight"] for p in self.particles])
        return 1.0 / np.sum(weights**2)
   
    def update_weights(self,
                      observations: np.ndarray,
                      forecasts: np.ndarray,
                      observation_error: Union[float, np.ndarray]) -> None:
        """
        Update particle weights using Bayesian inference.
       
        Args:
            observations: Observation values
            forecasts: Forecast values for each particle
            observation_error: Observation error variance(s)
        """
        n_obs = len(observations)
        observation_error = np.atleast_1d(observation_error)
       
        if len(observation_error) == 1:
            observation_error = np.repeat(observation_error, n_obs)
       
        # Update each particle
        for i, particle in enumerate(self.particles):
            if i < len(forecasts):
                # Calculate likelihood for each observation
                residuals = observations - forecasts[i]
                log_likelihood = -0.5 * np.sum(residuals**2 / observation_error) - \
                               0.5 * np.sum(np.log(2 * np.pi * observation_error))
               
                # Update log weight
                particle["log_weight"] += log_likelihood
                particle["likelihood"] = log_likelihood
       
        # Normalize weights (in log space for numerical stability)
        log_weights = np.array([p["log_weight"] for p in self.particles])
        max_log_weight = np.max(log_weights)
       
        # Subtract maximum for numerical stability
        normalized_log_weights = log_weights - max_log_weight
        weights = np.exp(normalized_log_weights)
        weight_sum = np.sum(weights)
       
        if weight_sum > 0:
            for i, particle in enumerate(self.particles):
                particle["weight"] = weights[i] / weight_sum
        else:
            # Fallback: uniform weights
            for particle in self.particles:
                particle["weight"] = 1.0 / self.n_particles
       
        # Store diagnostics
        current_weights = [p["weight"] for p in self.particles]
        self.weight_history.append(current_weights.copy())
        self.ess_history.append(self.effective_sample_size())
   
    def resample(self) -> bool:
        """
        Adaptive resampling based on effective sample size.
       
        Returns:
            True if resampling was performed
        """
        ess = self.effective_sample_size()
        threshold = self.resampling_threshold * self.n_particles
       
        if ess < threshold:
            weights = np.array([p["weight"] for p in self.particles])
           
            # Systematic resampling
            indices = self._systematic_resample(weights)
           
            # Create new particle set
            new_particles = []
            for idx in indices:
                new_particle = self.particles[idx].copy()
                new_particle["weight"] = 1.0 / self.n_particles
                new_particle["log_weight"] = -np.log(self.n_particles)
               
                # Deep copy of state and parameters
                new_particle["state"] = self.particles[idx]["state"].copy()
                new_particle["parameters"] = self.particles[idx]["parameters"].copy()
               
                new_particles.append(new_particle)
           
            self.particles = new_particles
           
            # Parameter inflation for diversity
            if self.adaptive_inflation:
                self._inflate_parameters()
           
            logger.debug(f"Resampled particles (ESS: {ess:.2f})")
            return True
       
        return False
   
    def _systematic_resample(self, weights: np.ndarray) -> np.ndarray:
        """Systematic resampling algorithm."""
        n = len(weights)
        indices = np.zeros(n, dtype=int)
       
        # Cumulative sum
        cumsum = np.cumsum(weights)
       
        # Systematic sampling
        u0 = self.rng.uniform(0, 1/n)
        j = 0
       
        for i in range(n):
            u = u0 + i / n
            while cumsum[j] < u:
                j += 1
            indices[i] = j
       
        return indices
   
    def _inflate_parameters(self, inflation_factor: float = 0.02) -> None:
        """Apply parameter inflation to maintain ensemble diversity."""
        for key in self.param_bounds.keys():
            if key.startswith('y0_') or key in ['rho', 'gamma', 'kappa', 'mu', 'Cn']:
                values = [p["parameters"][key] for p in self.particles]
                mean_val = np.mean(values)
                std_val = np.std(values)
               
                # Inflate around mean
                for particle in self.particles:
                    noise = self.rng.normal(0, inflation_factor * std_val)
                    new_val = particle["parameters"][key] + noise
                   
                    # Ensure bounds
                    bounds = self.param_bounds[key]
                    particle["parameters"][key] = np.clip(new_val, bounds[0], bounds[1])
   
    def get_ensemble_statistics(self) -> Dict[str, np.ndarray]:
        """Calculate ensemble statistics."""
        stats = {}
       
        # Parameter statistics
        for key in self.param_bounds.keys():
            values = [p["parameters"][key] for p in self.particles]
            weights = [p["weight"] for p in self.particles]
           
            stats[key] = {
                "mean": np.average(values, weights=weights),
                "std": np.sqrt(np.average((values - np.average(values, weights=weights))**2, weights=weights)),
                "median": np.percentile(values, 50),
                "q05": np.percentile(values, 5),
                "q95": np.percentile(values, 95)
            }
       
        return stats