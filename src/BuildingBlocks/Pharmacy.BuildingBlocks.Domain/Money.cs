namespace Pharmacy.BuildingBlocks.Domain;

/// <summary>
/// Monetary amount backed by <see cref="decimal"/> (BR-G-18: no floating point).
/// Document amounts round to 2 decimals and unit prices/costs to 4 decimals, always
/// <see cref="MidpointRounding.AwayFromZero"/>. Totals are sums of already-rounded lines.
/// </summary>
public readonly record struct Money(decimal Amount)
{
    public static readonly Money Zero = new(0m);

    public static Money Of(decimal amount) => new(amount);

    /// <summary>Rounds to 2 decimals, midpoint away from zero (document line/total precision).</summary>
    public Money RoundToDocument() => new(decimal.Round(Amount, 2, MidpointRounding.AwayFromZero));

    /// <summary>Rounds a unit price or cost to 4 decimals, midpoint away from zero.</summary>
    public static decimal RoundUnit(decimal value) => decimal.Round(value, 4, MidpointRounding.AwayFromZero);

    public static Money operator +(Money left, Money right) => new(left.Amount + right.Amount);

    public static Money operator -(Money left, Money right) => new(left.Amount - right.Amount);

    public static Money operator *(Money money, decimal quantity) => new(money.Amount * quantity);
}
