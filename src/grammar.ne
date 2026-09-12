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

  function convertList([d0, d1, d2]) {
    return {
      mode: 'list',
      value: [d0, ...(d2.mode === 'list' ? d2.value : [d2])],
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
    const value = WEEKDAY_MAP[d[0]];
    return { mode: 'specific', value: value };
  }

  function convertDayOfWeekValue(d) {
    const value = Array.isArray(d) ? d[0] : d;
    return WEEKDAY_MAP[value] || Number(value);
  }

  function convertDayOfWeekIncremental(d) {
    const starting = d[0] === '*' ? '*' : convertDayOfWeekValue(d[0]);
    return convertIncrementalFnFactory('dayOfWeek', 8, 1)([starting, d[1], d[2]]);
  }

  function convertLastDayOfWeekOfMonth(d) {
    const value = convertDayOfWeekValue(d[0]);
    if (value > 7 || value < 1) {
      throw new Error("(Day of Week) Day of week value must be between 1-7");
    }
    return {
      mode: 'dayOfWeekBeforeEndOfMonth',
      value,
    };
  }

  function convertNthWeekDayOfMonth(d) {
    const dayValue = convertDayOfWeekValue(d[0]);
    const nth = Number(d[2]);
    if (dayValue > 7 || dayValue < 1) {
      throw new Error(`(Day of Week) Value '${dayValue}#${nth}' is invalid for expression of type 'Nth'. Accepted values 1-7`);
    }
    if (nth > 5 || nth < 1) {
      throw new Error("(Day of Week) A numeric value between 1 and 5 must follow the '#' option");
    }
    return {
      mode: 'nthWeekDayOfMonth',
      value: [dayValue, nth],
    };
  }

  function convertDigitsToMonth(d) {
    const value = Number(d);
    if (value < 1 || value > 12) {
      throw new Error("Month must be between 1 and 12");
    }
    return { mode: 'specific', value: value };
  }

  function convertStringToMonth(d) {
    const value = MONTH_MAP[d[0]];
    return { mode: 'specific', value: value };
  }

  function convertMonthStringIncremental(d) {
    const starting = MONTH_MAP[d[0]];
    return convertIncrementalFnFactory('month', 13, 1)([starting, d[1], d[2]]);
  }

  function convertRangeMonthString(d) {
    const valueFrom = MONTH_MAP[d[0]];
    const valueTo = MONTH_MAP[d[2]];
    return { mode: 'range', value: [valueFrom, valueTo] };
  }

  function convertRangeDayOfWeekString(d) {
    const valueFrom = WEEKDAY_MAP[d[0]];
    const valueTo = WEEKDAY_MAP[d[2]];
    return { mode: 'range', value: [valueFrom, valueTo] };
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
      const starting = (d[0] === '*') ? lowerBoundary : Number(d[0]);
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
      return { mode: 'range', value: [start, end] };
    }
  }

  function convertRangeIncrementalFnFactory(fieldType, cycleRng, lowerBoundary = 0) {
    const convertIncremental = convertIncrementalFnFactory(fieldType, cycleRng, lowerBoundary);
    return (d) => {
      const [start, end] = d[0].value;
      const incremental = convertIncremental([start, d[1], d[2]]);
      return { mode: 'rangeIncrement', value: [start, end, incremental.value[1]] };
    };
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
  [ \t]:+ {% d => null %}

every -> "*" {% d => ({ mode: 'every', value: '*' }) %}

noSpecificValue -> "?" {% d => ({ mode: 'noSpecific', value: '?' }) %}

######################
#  Seconds settings  #
######################

seconds -> _seconds {% unwrapAndAddScopeName('seconds') %}

_seconds -> every | specificSeconds

specificSeconds
  -> specificSecondsItem "," specificSeconds {% convertList %}
   | specificSecondsItem {% id %}

specificSecondsItem -> specificSecond {% id %}
   | secondsRangeIncremental {% id %}
   | secondsRange {% id %}
   | secondsIncremental {% id %}

specificSecond -> digits {% convertDigitsToMinuteOrSecond %}

secondsIncremental
  -> digits "/" digits {% convertIncrementalFnFactory('Seconds', 60) %}
   | "*" "/" digits {% convertIncrementalFnFactory('Seconds', 60) %}

secondsRange -> digits "-" digits {% convertRangeFnFactory('Seconds', 60) %}

secondsRangeIncremental -> secondsRange "/" digits {% convertRangeIncrementalFnFactory('Seconds', 60) %}

#############
#  Minutes  #
#############

minutes -> _minutes {% unwrapAndAddScopeName('minutes') %}

_minutes -> specificMinutes | every

specificMinutes
  -> specificMinutesItem "," specificMinutes {% convertList %}
   | specificMinutesItem {% id %}

specificMinutesItem -> specificMinute {% id %}
   | minutesRangeIncremental {% id %}
   | minutesRange {% id %}
   | minutesIncremental {% id %}

specificMinute -> digits {% convertDigitsToMinuteOrSecond %}

minutesIncremental
  -> digits "/" digits {% convertIncrementalFnFactory('Minutes', 60) %}
   | "*" "/" digits {% convertIncrementalFnFactory('Minutes', 60) %}

minutesRange -> digits "-" digits {% convertRangeFnFactory('Minutes', 60) %}

minutesRangeIncremental -> minutesRange "/" digits {% convertRangeIncrementalFnFactory('Minutes', 60) %}


###########
#  Hours  #
###########

hours -> _hours {% unwrapAndAddScopeName('hours') %}

_hours -> specificHours | every

specificHours
  -> specificHoursItem "," specificHours {% convertList %}
   | specificHoursItem {% id %}

specificHoursItem -> specificHour {% id %}
   | hoursRangeIncremental {% id %}
   | hoursRange {% id %}
   | hoursIncremental {% id %}

specificHour -> digits {% convertDigitsToHour %}

hoursIncremental
  -> digits "/" digits {% convertIncrementalFnFactory('Hours', 24) %}
   | "*" "/" digits   {% convertIncrementalFnFactory('Hours', 24) %}

hoursRange -> digits "-" digits {% convertRangeFnFactory('Hours', 24) %}

hoursRangeIncremental -> hoursRange "/" digits {% convertRangeIncrementalFnFactory('Hours', 24) %}

##################
#  Day of month  #
##################

dayOfMonth -> _dayOfMonth {% unwrapAndAddScopeName('dayOfMonth') %}

_dayOfMonth -> specificDays | every | noSpecificValue

specificDays
  -> specificDaysListItem "," specificDaysListTail {% convertList %}
   | specificDaysListItem {% id %}

specificDaysListTail
  -> specificDaysListItem "," specificDaysListTail {% convertList %}
   | specificDaysListItem {% id %}

specificDaysListItem
  -> specificDaysItem {% id %}
   | lastDayOfMonth {% id %}
   | lastWeekdayOfMonth {% id %}
   | lastXDaysBeforeEndOfMonth {% id %}
   | lastXWeekdaysBeforeEndOfMonth {% id %}
   | nearestWeekdayOfMonth {% id %}

specificDaysItem -> specificDay {% id %}
   | dayOfMonthRangeIncremental {% id %}
   | dayOfMonthRange {% id %}
   | dayOfMonthIncremental {% id %}

specificDay -> digits {% convertDigitsToDay %}

dayOfMonthIncremental 
  -> digits "/" digits {% convertIncrementalFnFactory('dayOfMonth', 32, 1) %}
  | "*" "/" digits {% convertIncrementalFnFactory('dayOfMonth', 32, 1) %}

dayOfMonthRange -> digits "-" digits {% convertRangeFnFactory('dayOfMonth', 32) %}

dayOfMonthRangeIncremental -> dayOfMonthRange "/" digits {% convertRangeIncrementalFnFactory('dayOfMonth', 32, 1) %}

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

# L-nW (nearest weekday to n day(s) before the end of the month)
lastXWeekdaysBeforeEndOfMonth -> last "-" digits weekday
{% d => {
  const value = Number(d[2]);
  if (value > 30) {
    throw new Error("(Day of Month) Offset from last day must be <= 30");
  }
  return {
    mode: 'nearestWeekdayBeforeEndOfMonth',
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

_month -> specificMonths | every

specificMonths
  -> specificMonthItem "," specificMonths {% convertList %}
   | specificMonthItem {% id %}

specificMonthItem
  -> specificMonthDigit {% convertDigitsToMonth %}
   | specificMonthString {% convertStringToMonth %}
   | monthRangeIncremental {% id %}
   | monthRange {% id %}
   | monthIncremental {% id %}

specificMonthDigit -> digits

specificMonthString -> "JAN" | "FEB" | "MAR" | "APR" | "MAY" | "JUN" | "JUL" | "AUG" | "SEP" | "OCT" | "NOV" | "DEC"

monthIncremental
  -> digits "/" digits {% convertIncrementalFnFactory('month', 13, 1) %}
   | specificMonthString "/" digits {% convertMonthStringIncremental %}
   | "*" "/" digits {% convertIncrementalFnFactory('month', 13, 1) %}

monthRange
 ->  digits "-" digits  {% convertRangeFnFactory('month', 13, 1) %}
  |  specificMonthString "-" specificMonthString {% convertRangeMonthString %}

monthRangeIncremental -> monthRange "/" digits {% convertRangeIncrementalFnFactory('month', 13, 1) %}

##########################
#  Day of week settings  #
##########################

dayOfWeek -> _dayOfWeek {% unwrapAndAddScopeName('dayOfWeek') %}

_dayOfWeek -> specificDayOfWeeks | lastDayOfWeek | lastDayOfWeekOfMonth | nthWeekDayOfMonth | every | noSpecificValue

# Strangely, it is allowed to hybridize both string and numeric values. (e.g. SUN,2,3,FRI)
specificDayOfWeeks
  -> specificDayOfWeekItem "," specificDayOfWeeks {% convertList %}
   | specificDayOfWeekItem {% id %}

specificDayOfWeekItem
  -> specificDayOfWeekDigit {% convertDigitsToDayOfWeek %}
   | specificDayOfWeekString {% convertStringToDayOfWeek %}
   | dayOfWeekRangeIncremental {% id %}
   | dayOfWeekRange {% id %}
   | dayOfWeekIncremental {% id %}

specificDayOfWeekDigit -> digit

specificDayOfWeekString -> "SUN" | "MON" | "TUE" | "WED" | "THU" | "FRI" | "SAT"

dayOfWeekIncremental
  -> digits "/" digits {% convertDayOfWeekIncremental %}
   | specificDayOfWeekString "/" digits {% convertDayOfWeekIncremental %}
   | "*" "/" digits {% convertDayOfWeekIncremental %}

dayOfWeekRange
  -> digits "-" digits {% convertRangeFnFactory('dayOfWeek', 8) %}
   |  specificDayOfWeekString "-" specificDayOfWeekString {% convertRangeDayOfWeekString %}

dayOfWeekRangeIncremental -> dayOfWeekRange "/" digits {% convertRangeIncrementalFnFactory('dayOfWeek', 8, 1) %}

# L by itself is equivalent to SAT (7) in a Quartz day-of-week field.
lastDayOfWeek -> last {% d => ({ mode: 'specific', value: 7 }) %}

lastDayOfWeekOfMonth
  -> digits last {% convertLastDayOfWeekOfMonth %}
   | specificDayOfWeekString last {% convertLastDayOfWeekOfMonth %}

nthWeekDayOfMonth
  -> digits "#" digits {% convertNthWeekDayOfMonth %}
   | specificDayOfWeekString "#" digits {% convertNthWeekDayOfMonth %}

###################
#  Year settings  #
###################

years -> _years {% unwrapAndAddScopeName('years') %}

_years -> specificYears | every

specificYears
  -> specificYearsItem "," specificYears {% convertList %}
   | specificYearsItem {% id %}

specificYearsItem -> specificYear {% id %}
   | yearsRangeIncremental {% id %}
   | yearsRange {% id %}
   | yearsIncremental {% id %}

specificYear -> yearDigits {% convertDigitsToYear %}

yearsIncremental -> yearDigits "/" digits {% convertIncrementalFnFactory('Years', 2100, 1970) %}
  | "*" "/" digits {% convertIncrementalFnFactory('Years', 2100, 1970) %}

yearsRange -> yearDigits "-" yearDigits {% convertRangeFnFactory('Years', 2100, 1970) %}

yearsRangeIncremental -> yearsRange "/" digits {% convertRangeIncrementalFnFactory('Years', 2100, 1970) %}
