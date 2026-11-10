using FluentAssertions;
using NetArchTest.Rules;

namespace Pharmacy.ArchitectureTests;

public class DomainLayerTests
{
    private static readonly string[] Forbidden =
        ["Microsoft.EntityFrameworkCore", "Microsoft.AspNetCore", "Npgsql", "Hangfire", "FluentValidation"];

    [Fact] // AT-01
    public void Domain_assemblies_do_not_depend_on_infrastructure_frameworks()
    {
        var assemblies = new[]
        {
            typeof(Pharmacy.BuildingBlocks.Domain.AssemblyMarker).Assembly,
            typeof(Pharmacy.Modules.Organization.Domain.AssemblyMarker).Assembly,
        };

        foreach (var assembly in assemblies)
        {
            var result = Types.InAssembly(assembly).ShouldNot().HaveDependencyOnAny(Forbidden).GetResult();
            result.IsSuccessful.Should().BeTrue(
                $"{assembly.GetName().Name} must not reference {string.Join(", ", result.FailingTypeNames ?? [])}");
        }
    }
}
