using FluentAssertions;
using Microsoft.AspNetCore.Http;
using Pharmacy.BuildingBlocks.Domain;
using Pharmacy.BuildingBlocks.Web;

namespace Pharmacy.BuildingBlocks.Tests;

public class ProblemDetailsMappingTests
{
    [Theory]
    [InlineData(ErrorKind.Validation, 400)]
    [InlineData(ErrorKind.Forbidden, 403)]
    [InlineData(ErrorKind.NotFound, 404)]
    [InlineData(ErrorKind.Conflict, 409)]
    [InlineData(ErrorKind.PreconditionFailed, 412)]
    [InlineData(ErrorKind.Unprocessable, 422)]
    [InlineData(ErrorKind.PreconditionRequired, 428)]
    public void Maps_error_kind_to_http_status(ErrorKind kind, int expected)
        => ProblemDetailsMapping.StatusFor(kind).Should().Be(expected);

    [Fact]
    public void Problem_contains_code_traceId_and_field_errors()
    {
        var ctx = new DefaultHttpContext { TraceIdentifier = "trace-1" };
        var error = new Error("COMMON.VALIDATION_FAILED", "Validation failed", ErrorKind.Validation,
            new Dictionary<string, string[]> { ["quantity"] = ["COMMON.MUST_BE_POSITIVE"] });

        var problem = ProblemDetailsMapping.ToProblem(error, ctx);

        problem.Status.Should().Be(400);
        problem.Title.Should().Be("Validation failed");
        problem.Extensions["code"].Should().Be("COMMON.VALIDATION_FAILED");
        problem.Extensions["traceId"].Should().Be("trace-1");
        problem.Extensions.Should().ContainKey("errors");
    }

    [Fact]
    public void Problem_without_field_errors_has_no_errors_extension()
    {
        var ctx = new DefaultHttpContext { TraceIdentifier = "t" };

        var problem = ProblemDetailsMapping.ToProblem(new Error("COMMON.NOT_FOUND", "Not found", ErrorKind.NotFound), ctx);

        problem.Extensions.Should().NotContainKey("errors");
    }
}
