// Generated automatically by nearley, version 2.20.1
// http://github.com/Hardmath123/nearley
(function () {
function id(x) { return x[0]; }

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
var grammar = {
    Lexer: undefined,
    ParserRules: [
    {"name": "quartzCronExpr", "symbols": ["quartzCronExprFields"], "postprocess":  d => {
          return [...d[0]].filter(item => item != null);
        } },
    {"name": "quartzCronExprFields", "symbols": ["seconds", "_", "minutes", "_", "hours", "_", "dayOfMonth", "_", "month", "_", "dayOfWeek"]},
    {"name": "quartzCronExprFields", "symbols": ["seconds", "_", "minutes", "_", "hours", "_", "dayOfMonth", "_", "month", "_", "dayOfWeek", "_", "years"]},
    {"name": "digits$ebnf$1", "symbols": ["digit"]},
    {"name": "digits$ebnf$1", "symbols": ["digits$ebnf$1", "digit"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "digits", "symbols": ["digits$ebnf$1"], "postprocess":  d => {
            const value = [];
            for (let i = 0; i < d[0].length; ++i) {
                value.push(d[0][i][0]);
            }
            return value.join('');
        } },
    {"name": "digit", "symbols": [{"literal":"0"}]},
    {"name": "digit", "symbols": [{"literal":"1"}]},
    {"name": "digit", "symbols": [{"literal":"2"}]},
    {"name": "digit", "symbols": [{"literal":"3"}]},
    {"name": "digit", "symbols": [{"literal":"4"}]},
    {"name": "digit", "symbols": [{"literal":"5"}]},
    {"name": "digit", "symbols": [{"literal":"6"}]},
    {"name": "digit", "symbols": [{"literal":"7"}]},
    {"name": "digit", "symbols": [{"literal":"8"}]},
    {"name": "digit", "symbols": [{"literal":"9"}]},
    {"name": "yearDigits$string$1", "symbols": [{"literal":"1"}, {"literal":"9"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "yearDigits", "symbols": ["yearDigits$string$1", "digit", "digit"], "postprocess": ([d0, d1, d2]) => `${d0}${d1}${d2}`},
    {"name": "yearDigits$string$2", "symbols": [{"literal":"2"}, {"literal":"0"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "yearDigits", "symbols": ["yearDigits$string$2", "digit", "digit"], "postprocess": ([d0, d1, d2]) => `${d0}${d1}${d2}`},
    {"name": "last", "symbols": [{"literal":"L"}]},
    {"name": "weekday", "symbols": [{"literal":"W"}]},
    {"name": "_$ebnf$1", "symbols": [/[ ]/]},
    {"name": "_$ebnf$1", "symbols": ["_$ebnf$1", /[ ]/], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "_", "symbols": ["_$ebnf$1"], "postprocess": d => null},
    {"name": "every", "symbols": [{"literal":"*"}], "postprocess": d => ({ mode: 'every', value: '*' })},
    {"name": "noSpecificValue", "symbols": [{"literal":"?"}], "postprocess": d => ({ mode: 'noSpecific', value: '?' })},
    {"name": "seconds", "symbols": ["_seconds"], "postprocess": unwrapAndAddScopeName('seconds')},
    {"name": "_seconds", "symbols": ["every"]},
    {"name": "_seconds", "symbols": ["secondsIncremental"]},
    {"name": "_seconds", "symbols": ["secondsRange"]},
    {"name": "_seconds", "symbols": ["specificSeconds"]},
    {"name": "specificSeconds", "symbols": ["specificSecond", {"literal":","}, "specificSeconds"], "postprocess": convertSpecifics},
    {"name": "specificSeconds", "symbols": ["specificSecond"], "postprocess": id},
    {"name": "specificSecond", "symbols": ["digits"], "postprocess": convertDigitsToMinuteOrSecond},
    {"name": "secondsIncremental", "symbols": ["digits", {"literal":"/"}, "digits"], "postprocess": convertIncrementalFnFactory('Seconds', 60)},
    {"name": "secondsRange", "symbols": ["digits", {"literal":"-"}, "digits"], "postprocess": convertRangeFnFactory('Seconds', 60)},
    {"name": "minutes", "symbols": ["_minutes"], "postprocess": unwrapAndAddScopeName('minutes')},
    {"name": "_minutes", "symbols": ["specificMinutes"]},
    {"name": "_minutes", "symbols": ["minutesIncremental"]},
    {"name": "_minutes", "symbols": ["minutesRange"]},
    {"name": "_minutes", "symbols": ["every"]},
    {"name": "specificMinutes", "symbols": ["specificMinute", {"literal":","}, "specificMinutes"], "postprocess": convertSpecifics},
    {"name": "specificMinutes", "symbols": ["specificMinute"], "postprocess": id},
    {"name": "specificMinute", "symbols": ["digits"], "postprocess": convertDigitsToMinuteOrSecond},
    {"name": "minutesIncremental", "symbols": ["digits", {"literal":"/"}, "digits"], "postprocess": convertIncrementalFnFactory('Minutes', 60)},
    {"name": "minutesRange", "symbols": ["digits", {"literal":"-"}, "digits"], "postprocess": convertRangeFnFactory('Minutes', 60)},
    {"name": "hours", "symbols": ["_hours"], "postprocess": unwrapAndAddScopeName('hours')},
    {"name": "_hours", "symbols": ["specificHours"]},
    {"name": "_hours", "symbols": ["hoursIncremental"]},
    {"name": "_hours", "symbols": ["hoursRange"]},
    {"name": "_hours", "symbols": ["every"]},
    {"name": "specificHours", "symbols": ["specificHour", {"literal":","}, "specificHours"], "postprocess": convertSpecifics},
    {"name": "specificHours", "symbols": ["specificHour"], "postprocess": id},
    {"name": "specificHour", "symbols": ["digits"], "postprocess": convertDigitsToHour},
    {"name": "hoursIncremental", "symbols": ["digits", {"literal":"/"}, "digits"], "postprocess": convertIncrementalFnFactory('Hours', 24)},
    {"name": "hoursRange", "symbols": ["digits", {"literal":"-"}, "digits"], "postprocess": convertRangeFnFactory('Hours', 24)},
    {"name": "dayOfMonth", "symbols": ["_dayOfMonth"], "postprocess": unwrapAndAddScopeName('dayOfMonth')},
    {"name": "_dayOfMonth", "symbols": ["specificDays"]},
    {"name": "_dayOfMonth", "symbols": ["every"]},
    {"name": "_dayOfMonth", "symbols": ["noSpecificValue"]},
    {"name": "_dayOfMonth", "symbols": ["lastDayOfMonth"]},
    {"name": "_dayOfMonth", "symbols": ["lastWeekdayOfMonth"]},
    {"name": "_dayOfMonth", "symbols": ["lastXDaysBeforeEndOfMonth"]},
    {"name": "_dayOfMonth", "symbols": ["nearestWeekdayOfMonth"]},
    {"name": "specificDays", "symbols": ["specificDay", {"literal":","}, "specificDays"], "postprocess": convertSpecifics},
    {"name": "specificDays", "symbols": ["specificDay"], "postprocess": id},
    {"name": "specificDay", "symbols": ["digits"], "postprocess": convertDigitsToDay},
    {"name": "lastDayOfMonth", "symbols": ["last"], "postprocess": d => ({ mode: 'daysBeforeEndOfMonth', value: 0 })},
    {"name": "lastWeekdayOfMonth", "symbols": ["last", "weekday"], "postprocess": d => ({ mode: 'lastweekDay', value: 0 })},
    {"name": "lastXDaysBeforeEndOfMonth", "symbols": ["last", {"literal":"-"}, "digits"], "postprocess":  d => {
          const value = Number(d[2]);
          if (value > 30) {
            throw new Error("(Day of Month) Offset from last day must be <= 30");
          }
          return {
            mode: 'daysBeforeEndOfMonth',
            value,
          };
        } },
    {"name": "nearestWeekdayOfMonth", "symbols": ["digits", "weekday"], "postprocess":  d => {
          const value = Number(d[0]);
          if (value > 31) {
            throw new Error("(Day of Month) The 'W' option does not make sense with values larger than 31 (max number of days in a month)");
          }
          return {
            mode: 'nearestWeekdayOfMonth',
            value,
          };
        } },
    {"name": "month", "symbols": ["_month"], "postprocess": unwrapAndAddScopeName('month')},
    {"name": "_month", "symbols": ["monthItems"]},
    {"name": "_month", "symbols": ["every"]},
    {"name": "monthItems", "symbols": ["monthItem"]},
    {"name": "monthItems", "symbols": ["monthItem", {"literal":","}, "monthItems"]},
    {"name": "monthItem", "symbols": ["digits"]},
    {"name": "monthItem", "symbols": ["monthStrFormat"]},
    {"name": "monthStrFormat$string$1", "symbols": [{"literal":"J"}, {"literal":"A"}, {"literal":"N"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "monthStrFormat", "symbols": ["monthStrFormat$string$1"]},
    {"name": "monthStrFormat$string$2", "symbols": [{"literal":"F"}, {"literal":"E"}, {"literal":"B"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "monthStrFormat", "symbols": ["monthStrFormat$string$2"]},
    {"name": "monthStrFormat$string$3", "symbols": [{"literal":"M"}, {"literal":"A"}, {"literal":"R"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "monthStrFormat", "symbols": ["monthStrFormat$string$3"]},
    {"name": "monthStrFormat$string$4", "symbols": [{"literal":"A"}, {"literal":"P"}, {"literal":"R"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "monthStrFormat", "symbols": ["monthStrFormat$string$4"]},
    {"name": "monthStrFormat$string$5", "symbols": [{"literal":"M"}, {"literal":"A"}, {"literal":"Y"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "monthStrFormat", "symbols": ["monthStrFormat$string$5"]},
    {"name": "monthStrFormat$string$6", "symbols": [{"literal":"J"}, {"literal":"U"}, {"literal":"N"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "monthStrFormat", "symbols": ["monthStrFormat$string$6"]},
    {"name": "monthStrFormat$string$7", "symbols": [{"literal":"J"}, {"literal":"U"}, {"literal":"L"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "monthStrFormat", "symbols": ["monthStrFormat$string$7"]},
    {"name": "monthStrFormat$string$8", "symbols": [{"literal":"A"}, {"literal":"U"}, {"literal":"G"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "monthStrFormat", "symbols": ["monthStrFormat$string$8"]},
    {"name": "monthStrFormat$string$9", "symbols": [{"literal":"S"}, {"literal":"E"}, {"literal":"P"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "monthStrFormat", "symbols": ["monthStrFormat$string$9"]},
    {"name": "monthStrFormat$string$10", "symbols": [{"literal":"O"}, {"literal":"C"}, {"literal":"T"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "monthStrFormat", "symbols": ["monthStrFormat$string$10"]},
    {"name": "monthStrFormat$string$11", "symbols": [{"literal":"N"}, {"literal":"O"}, {"literal":"V"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "monthStrFormat", "symbols": ["monthStrFormat$string$11"]},
    {"name": "monthStrFormat$string$12", "symbols": [{"literal":"D"}, {"literal":"E"}, {"literal":"C"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "monthStrFormat", "symbols": ["monthStrFormat$string$12"], "postprocess": d => MONTH_MAP[d]},
    {"name": "dayOfWeek", "symbols": ["_dayOfWeek"], "postprocess": unwrapAndAddScopeName('dayOfWeek')},
    {"name": "_dayOfWeek", "symbols": ["specificWeekdayDigits"]},
    {"name": "_dayOfWeek", "symbols": ["specificWeekdaysStrs"]},
    {"name": "_dayOfWeek", "symbols": ["every"]},
    {"name": "_dayOfWeek", "symbols": ["noSpecificValue"]},
    {"name": "specificWeekdayDigits", "symbols": ["specificWeekdayDigit", {"literal":","}, "specificWeekdayDigits"], "postprocess": convertSpecifics},
    {"name": "specificWeekdayDigits", "symbols": ["specificWeekdayDigit"], "postprocess": id},
    {"name": "specificWeekdayDigit", "symbols": ["digits"], "postprocess": convertDigitsToDayOfWeek},
    {"name": "specificWeekdaysStrs", "symbols": ["specificWeekdayString", {"literal":","}, "specificWeekdaysStrs"], "postprocess": convertDayOfMapStringSpecifics},
    {"name": "specificWeekdaysStrs", "symbols": ["specificWeekdayString"], "postprocess": convertStringToDayOfWeek},
    {"name": "specificWeekdayString$string$1", "symbols": [{"literal":"S"}, {"literal":"U"}, {"literal":"N"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "specificWeekdayString", "symbols": ["specificWeekdayString$string$1"]},
    {"name": "specificWeekdayString$string$2", "symbols": [{"literal":"M"}, {"literal":"O"}, {"literal":"N"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "specificWeekdayString", "symbols": ["specificWeekdayString$string$2"]},
    {"name": "specificWeekdayString$string$3", "symbols": [{"literal":"T"}, {"literal":"U"}, {"literal":"E"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "specificWeekdayString", "symbols": ["specificWeekdayString$string$3"]},
    {"name": "specificWeekdayString$string$4", "symbols": [{"literal":"W"}, {"literal":"E"}, {"literal":"D"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "specificWeekdayString", "symbols": ["specificWeekdayString$string$4"]},
    {"name": "specificWeekdayString$string$5", "symbols": [{"literal":"T"}, {"literal":"H"}, {"literal":"U"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "specificWeekdayString", "symbols": ["specificWeekdayString$string$5"]},
    {"name": "specificWeekdayString$string$6", "symbols": [{"literal":"F"}, {"literal":"R"}, {"literal":"I"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "specificWeekdayString", "symbols": ["specificWeekdayString$string$6"]},
    {"name": "specificWeekdayString$string$7", "symbols": [{"literal":"S"}, {"literal":"A"}, {"literal":"T"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "specificWeekdayString", "symbols": ["specificWeekdayString$string$7"], "postprocess": convertStringToDayOfWeek},
    {"name": "years", "symbols": ["_years"], "postprocess": unwrapAndAddScopeName('years')},
    {"name": "_years", "symbols": ["yearsIncremental"]},
    {"name": "_years", "symbols": ["yearsRange"]},
    {"name": "_years", "symbols": ["specificYears"]},
    {"name": "_years", "symbols": ["every"]},
    {"name": "specificYears", "symbols": ["specificYear", {"literal":","}, "specificYears"], "postprocess": convertSpecifics},
    {"name": "specificYears", "symbols": ["specificYear"], "postprocess": id},
    {"name": "specificYear", "symbols": ["yearDigits"], "postprocess": convertDigitsToYear},
    {"name": "yearsIncremental", "symbols": ["yearDigits", {"literal":"/"}, "digits"], "postprocess": convertIncrementalFnFactory('Years', 2099, 1970)},
    {"name": "yearsRange", "symbols": ["yearDigits", {"literal":"-"}, "yearDigits"], "postprocess": convertRangeFnFactory('Years', 2099, 1970)}
]
  , ParserStart: "quartzCronExpr"
}
if (typeof module !== 'undefined'&& typeof module.exports !== 'undefined') {
   module.exports = grammar;
} else {
   window.grammar = grammar;
}
})();