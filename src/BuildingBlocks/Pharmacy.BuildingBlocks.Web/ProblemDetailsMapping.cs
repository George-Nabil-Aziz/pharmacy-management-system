using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Pharmacy.BuildingBlocks.Domain;

namespace Pharmacy.BuildingBlocks.Web;

/// <summary>Maps <see cref="Error"/> to RFC 9457 Problem Details with extensions code, traceId and errors.</summary>
public static class ProblemDetailsMapping
{
    public static int StatusFor(ErrorKind kind) => kind switch
    {
        ErrorKind.Validation => StatusCodes.Status400BadRequest,
        ErrorKind.Forbidden => StatusCodes.Status403Forbidden,
        ErrorKind.NotFound => StatusCodes.Status404NotFound,
        ErrorKind.Conflict => StatusCodes.Status409Conflict,
        ErrorKind.PreconditionFailed => StatusCodes.Status412PreconditionFailed,
        ErrorKind.Unprocessable => StatusCodes.Status422UnprocessableEntity,
        ErrorKind.PreconditionRequired => StatusCodes.Status428PreconditionRequired,
        _ => StatusCodes.Status500InternalServerError,
    };

    public static ProblemDetails ToProblem(Error error, HttpContext context)
    {
        ArgumentNullException.ThrowIfNull(error);
        ArgumentNullException.ThrowIfNull(context);

        var problem = new ProblemDetails { Status = StatusFor(error.Kind), Title = error.Message };
        problem.Extensions["code"] = error.Code;
        problem.Extensions["traceId"] = context.TraceIdentifier;
        if (error.FieldErrors is not null)
        {
            problem.Extensions["errors"] = error.FieldErrors;
        }

        return problem;
    }

    public static IResult ToHttpResult(Error error, HttpContext context)
    {
        var problem = ToProblem(error, context);
        return Results.Problem(problem.Detail, statusCode: problem.Status, title: problem.Title, extensions: problem.Extensions);
    }
}
