class QueryValidationError(Exception):
    """Raised when generated Cypher does not satisfy read-only constraints."""
