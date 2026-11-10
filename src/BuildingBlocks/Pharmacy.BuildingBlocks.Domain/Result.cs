namespace Pharmacy.BuildingBlocks.Domain;

/// <summary>Outcome of an operation that can fail with an <see cref="Domain.Error"/>.</summary>
public class Result
{
    protected Result(Error? error) => Error = error;

    public Error? Error { get; }

    public bool IsSuccess => Error is null;

    public static Result Success() => new(null);

    public static Result Failure(Error error) => new(error);
}

/// <summary>Outcome carrying a value on success.</summary>
public sealed class Result<T> : Result
{
    private Result(T? value, Error? error) : base(error) => Value = value;

    public T? Value { get; }

    public static Result<T> Success(T value) => new(value, null);

    public static new Result<T> Failure(Error error) => new(default, error);
}
