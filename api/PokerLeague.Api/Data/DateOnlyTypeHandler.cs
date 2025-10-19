using System.Data;
using Dapper;

namespace PokerLeague.Api.Data;

/// <summary>
/// Dapper type handler for DateOnly (not natively supported)
/// </summary>
public class DateOnlyTypeHandler : SqlMapper.TypeHandler<DateOnly>
{
    public override DateOnly Parse(object value)
    {
        if (value is DateTime dateTime)
        {
            return DateOnly.FromDateTime(dateTime);
        }
        if (value is string stringValue)
        {
            return DateOnly.Parse(stringValue);
        }
        throw new InvalidCastException($"Cannot convert {value?.GetType()} to DateOnly");
    }

    public override void SetValue(IDbDataParameter parameter, DateOnly value)
    {
        parameter.DbType = DbType.Date;
        parameter.Value = value.ToDateTime(TimeOnly.MinValue);
    }
}
