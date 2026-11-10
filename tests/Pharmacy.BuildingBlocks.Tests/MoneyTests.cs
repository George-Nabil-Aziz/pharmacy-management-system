using FluentAssertions;
using Pharmacy.BuildingBlocks.Domain;

namespace Pharmacy.BuildingBlocks.Tests;

public class MoneyTests
{
    [Theory]
    [InlineData(10.005, 10.01)] // midpoint rounds away from zero (BR-G-18)
    [InlineData(10.004, 10.00)]
    [InlineData(-10.005, -10.01)]
    public void Document_amounts_round_to_2dp_away_from_zero(double input, double expected)
        => Money.Of((decimal)input).RoundToDocument().Amount.Should().Be((decimal)expected);

    [Fact]
    public void Unit_prices_round_to_4dp()
        => Money.RoundUnit(1.23456m).Should().Be(1.2346m);

    [Fact]
    public void Line_total_is_rounded_then_summed()
    {
        // 3 x 3.335 = 10.005 -> 10.01 ; 2 x 0.125 = 0.25 -> 0.25 ; total 10.26
        var lines = new[] { Money.Of(3.335m) * 3, Money.Of(0.125m) * 2 }.Select(m => m.RoundToDocument());

        lines.Aggregate(Money.Zero, (a, b) => a + b).Amount.Should().Be(10.26m);
    }
}
