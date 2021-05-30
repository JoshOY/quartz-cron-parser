# Pre-defined

@{%
  const MONTH_MAP = {
    JAN: 1,
    FEB: 2,
    MAR: 3,
    APR: 4,
    MAY: 5,
    JUN: 6,
    JUL: 7,
    AUG: 8,
    SEP: 9,
    OCT: 10,
    NOV: 11,
    DEC: 12,
  };

  const WEEKDAY_MAP = {
    SUN: 1,
    MON: 2,
    TUE: 3,
    WED: 4,
    THU: 5,
    FRI: 6,
    SAT: 7,
  };

  function unwrapAndAddScopeName(fieldName) {
    return (d) => {
      let obj = d;
      while ('0' in obj) {
        obj = obj[0];
      }
      return ({ field: fieldName, ...obj });
    }
  }

  function convertSpecifics([d0, d1, d2]) {
    return {
      mode: 'specific',
      value: Array.isArray(d2.value) ? [d0.value, ...d2.value] : [d0.value, d2.value],
    };
  }

  function convertDayOfMapStringSpecifics([d0, d1, d2]) {
    return {
      mode: 'specific',
      value: Array.isArray(d2.value) ? [WEEKDAY_MAP[d0[0]], ...d2.value] : [WEEKDAY_MAP[d0[0]], d2.value],
    };
  }

  function convertDigitsToMinuteOrSecond(d) {
    const value = Number(d);
    if (value >= 60) {
      throw new Error("Minute and Second values must be between 0 and 59");
    }
    return { mode: 'specific', value: value };
  }

  function convertDigitsToHour(d) {
    const value = Number(d);
    if (value >= 24) {
      throw new Error("Hour must be between 0 and 23");
    }
    return { mode: 'specific', value: value };
  }

  function convertDigitsToDay(d) {
    const value = Number(d);
    if ((value < 1) || (value > 31)) {
      throw new Error("Day must be between 1 and 31");
    }
    return { mode: 'specific', value: value };
  }

  function convertDigitsToDayOfWeek(d) {
    const value = Number(d);
    if ((value < 1) || (value > 7)) {
      throw new Error("Day of week must be between 1 and 7");
    }
    return { mode: 'specific', value: value };
  }

  function convertStringToDayOfWeek(d) {
    const value = WEEKDAY_MAP[`${d}`];
    return { mode: 'specific', value: value };
  }

  function convertDigitsToYear(d) {
    const value = Number(d);
    if ((value < 1970) || (value > 2099)) {
      throw new Error("Year must be between 1970 and 2099");
    }
    return { mode: 'specific', value: value };
  }


  function convertIncrementalFnFactory(fieldType, cycleRng, lowerBoundary = 0) {
    // Example: "5/20" represents: Every 20 seconds starting at second 5
    return (d) => {
      // d: [5, "/", 20]
      const starting = Number(d[0]);
      const interval = Number(d[2]);
      if ((starting >= cycleRng) || (starting < lowerBoundary)) {
        throw new Error(`(${fieldType}) Expression '${starting}' is not a valid increment value. Accepted values are ${lowerBoundary}-${cycleRng - 1}`);
      }
      if (interval >= cycleRng) {
        throw new Error(`(${fieldType}) Expression '${interval}' is not a valid increment value. Accepted values are 0-${cycleRng - 1}`);
      }
      return { mode: 'increment', value: [starting, interval] };
    };
  }

  function convertRangeFnFactory(fieldType, cycleRng, lowerBoundary = 0) {
    return (d) => {
      const start = Number(d[0]);
      const end = Number(d[2]);
      if (start >= cycleRng || end < lowerBoundary) {
        throw new Error(`(${fieldType}) Unsupported value '${start}-${end}' for range. Accepted values are ${lowerBoundary}-${cycleRng - 1}`);
      }
      if (end >= cycleRng || end < lowerBoundary) {
        throw new Error(`(${fieldType}) Unsupported value '${start}-${end}' for range. Accepted values are ${lowerBoundary}-${cycleRng - 1}`);
      }
      if (start > end) {
        throw new Error(`(${fieldType}) Unsupported value '${start}-${end}' for range. Accepted values are ${lowerBoundary}-${cycleRng - 1}`);
      }
      return { mode: 'range', value: [start, end] };
    }
  }
%}

#####################################
# Quartz cron expression definition #
#####################################

quartzCronExpr -> quartzCronExprFields {% d => {
  return [...d[0]].filter(item => item != null);
} %}

quartzCronExprFields
    -> seconds _ minutes _ hours _ dayOfMonth _ month _ dayOfWeek
    | seconds _ minutes _ hours _ dayOfMonth _ month _ dayOfWeek _ years

#############
#  Commons  #
#############

digits -> digit:+
{% d => {
    const value = [];
    for (let i = 0; i < d[0].length; ++i) {
        value.push(d[0][i][0]);
    }
    return value.join('');
} %}

digit
    -> "0"
    | "1"
    | "2"
    | "3"
    | "4"
    | "5"
    | "6"
    | "7"
    | "8"
    | "9"

yearDigits -> "19" digit digit {% ([d0, d1, d2]) => `${d0}${d1}${d2}` %}
    | "20" digit digit {% ([d0, d1, d2]) => `${d0}${d1}${d2}` %}

last -> "L"

weekday -> "W"

_ ->
  [ ]:+ {% d => null %}

every -> "*" {% d => ({ mode: 'every', value: '*' }) %}

noSpecificValue -> "?" {% d => ({ mode: 'noSpecific', value: '?' }) %}

######################
#  Seconds settings  #
######################

seconds -> _seconds {% unwrapAndAddScopeName('seconds') %}

_seconds -> every | secondsIncremental | secondsRange | specificSeconds

specificSeconds
 -> specificSecond "," specificSeconds {% convertSpecifics %}
  | specificSecond {% id %}

specificSecond -> digits {% convertDigitsToMinuteOrSecond %}

secondsIncremental -> digits "/" digits {% convertIncrementalFnFactory('Seconds', 60) %}

secondsRange -> digits "-" digits {% convertRangeFnFactory('Seconds', 60) %}

#############
#  Minutes  #
#############

minutes -> _minutes {% unwrapAndAddScopeName('minutes') %}

_minutes -> specificMinutes | minutesIncremental | minutesRange | every

specificMinutes
  -> specificMinute "," specificMinutes {% convertSpecifics %}
  |  specificMinute {% id %}

specificMinute -> digits {% convertDigitsToMinuteOrSecond %}

minutesIncremental -> digits "/" digits {% convertIncrementalFnFactory('Minutes', 60) %}

minutesRange -> digits "-" digits {% convertRangeFnFactory('Minutes', 60) %}


###########
#  Hours  #
###########

hours -> _hours {% unwrapAndAddScopeName('hours') %}

_hours -> specificHours | hoursIncremental | hoursRange | every

specificHours
  -> specificHour "," specificHours {% convertSpecifics %}
  |  specificHour {% id %}

specificHour -> digits {% convertDigitsToHour %}

hoursIncremental -> digits "/" digits {% convertIncrementalFnFactory('Hours', 24) %}

hoursRange -> digits "-" digits {% convertRangeFnFactory('Hours', 24) %}

##################
#  Day of month  #
##################

dayOfMonth -> _dayOfMonth {% unwrapAndAddScopeName('dayOfMonth') %}

_dayOfMonth -> specificDays | every | noSpecificValue | lastDayOfMonth | lastWeekdayOfMonth | lastXDaysBeforeEndOfMonth | nearestWeekdayOfMonth

specificDays
  -> specificDay "," specificDays  {% convertSpecifics %}
  |  specificDay {% id %}

specificDay -> digits {% convertDigitsToDay %}

# L (Last day of the month)
lastDayOfMonth -> last {% d => ({ mode: 'daysBeforeEndOfMonth', value: 0 }) %}

# LW (On the last weekday of the month)
lastWeekdayOfMonth -> last weekday {% d => ({ mode: 'lastweekDay', value: 0 }) %}

# L-n (n day(s) before the end of the month)
lastXDaysBeforeEndOfMonth -> last "-" digits
{% d => {
  const value = Number(d[2]);
  if (value > 30) {
    throw new Error("(Day of Month) Offset from last day must be <= 30");
  }
  return {
    mode: 'daysBeforeEndOfMonth',
    value,
  };
} %}

# Nearest weekday (Monday to Friday) to the nth of the month
nearestWeekdayOfMonth -> digits weekday
{% d => {
  const value = Number(d[0]);
  if (value > 31) {
    throw new Error("(Day of Month) The 'W' option does not make sense with values larger than 31 (max number of days in a month)");
  }
  return {
    mode: 'nearestWeekdayOfMonth',
    value,
  };
} %}


###########
#  Month  #
###########

month -> _month  {% unwrapAndAddScopeName('month') %}

_month -> monthItems | every

monthItems -> monthItem
    |  monthItem "," monthItems

monthItem -> digits | monthStrFormat

monthStrFormat -> "JAN" | "FEB" | "MAR" | "APR" | "MAY" | "JUN" | "JUL" | "AUG" | "SEP" | "OCT" | "NOV" | "DEC" {% d => MONTH_MAP[d] %}

##########################
#  Day of week settings  #
##########################

dayOfWeek -> _dayOfWeek {% unwrapAndAddScopeName('dayOfWeek') %}

_dayOfWeek -> specificWeekdayDigits | specificWeekdaysStrs | every | noSpecificValue

specificWeekdayDigits
 -> specificWeekdayDigit "," specificWeekdayDigits {% convertSpecifics %}
  | specificWeekdayDigit {% id %}

specificWeekdayDigit -> digits {% convertDigitsToDayOfWeek %}

specificWeekdaysStrs
 -> specificWeekdayString "," specificWeekdaysStrs {% convertDayOfMapStringSpecifics %}
  | specificWeekdayString {% convertStringToDayOfWeek %}

specificWeekdayString -> "SUN" | "MON" | "TUE" | "WED" | "THU" | "FRI" | "SAT" {% convertStringToDayOfWeek %}

###################
#  Year settings  #
###################

years -> _years {% unwrapAndAddScopeName('years') %}

_years ->  yearsIncremental | yearsRange | specificYears | every

specificYears
  -> specificYear "," specificYears {% convertSpecifics %}
  |  specificYear {% id %}

specificYear -> yearDigits {% convertDigitsToYear %}

yearsIncremental -> yearDigits "/" digits {% convertIncrementalFnFactory('Years', 2099, 1970) %}

yearsRange -> yearDigits "-" yearDigits {% convertRangeFnFactory('Years', 2099, 1970) %}
