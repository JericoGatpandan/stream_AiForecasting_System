class ValidationError(Exception):
    """Raised for invalid configuration or inputs."""
    pass

class NumericalError(Exception):
    """Raised when numerical integration fails or becomes unstable."""
    pass