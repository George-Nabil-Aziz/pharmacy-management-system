namespace Pharmacy.BuildingBlocks.Domain;

/// <summary>Category of a failure; the web layer maps it to an HTTP status (API-DESIGN §4).</summary>
public enum ErrorKind
{
    Validation,
    Forbidden,
    NotFound,
    Conflict,
    PreconditionFailed,
    PreconditionRequired,
    Unprocessable,
}

/// <summary>A domain/application error with a stable machine-readable <see cref="Code"/> (MODULE.ERROR_NAME).</summary>
public sealed record Error(
    string Code,
    string Message,
    ErrorKind Kind,
    IReadOnlyDictionary<string, string[]>? FieldErrors = null);
