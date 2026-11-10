using System.Net;
using System.Text.Json;
using FluentAssertions;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;

namespace Pharmacy.IntegrationTests;

public sealed class UnhandledExceptionTests(WebApplicationFactory<Program> factory) : IClassFixture<WebApplicationFactory<Program>>
{
    [Fact]
    public async Task Unhandled_exception_returns_500_problem_details_without_stack_trace()
    {
        using var testing = factory.WithWebHostBuilder(b => b.UseEnvironment("Testing"));
        using var client = testing.CreateClient();

        var response = await client.GetAsync(new Uri("/test/throw", UriKind.Relative));
        var body = await response.Content.ReadAsStringAsync();

        response.StatusCode.Should().Be(HttpStatusCode.InternalServerError);
        response.Content.Headers.ContentType?.MediaType.Should().Be("application/problem+json");
        using var json = JsonDocument.Parse(body);
        json.RootElement.GetProperty("status").GetInt32().Should().Be(500);
        body.Should().NotContain("at Program").And.NotContain("InvalidOperationException").And.NotContain("secret-internal-detail");
    }
}
