// fork from "https://github.com/npm/cmd-shim/blob/main/lib/index.js"
const { dirname, relative } = require("path");
const {
  chmod,
  mkdir,
  readFile,
  stat,
  unlink,
  writeFile,
} = require("fs/promises");

const shebangExpr =
  /^#!\s*(?:\/usr\/bin\/env\s*((?:[^ \t=]+=[^ \t=]+\s+)*))?([^ \t]+)(.*)$/;

const convertToSetCommand = (key, value) => {
  let line = "";
  key = key || "";
  key = key.trim();
  value = value || "";
  value = value.trim();
  if (key && value && value.length > 0) {
    line = "@SET " + key + "=" + replaceDollarWithPercentPair(value) + "\r\n";
  }
  return line;
};

const extractVariableValuePairs = (declarations) => {
  const pairs = {};
  declarations.map(function (declaration) {
    const split = declaration.split("=");
    pairs[split[0]] = split[1];
  });
  return pairs;
};

const convertToSetCommands = (variableString) => {
  let variableDeclarationsAsBatch = "";
  const variableValuePairs = extractVariableValuePairs(
    variableString.split(" ")
  );
  Object.keys(variableValuePairs).forEach(function (key) {
    variableDeclarationsAsBatch += convertToSetCommand(
      key,
      variableValuePairs[key]
    );
  });
  return variableDeclarationsAsBatch;
};

const replaceDollarWithPercentPair = (value) => {
  const dollarExpressions = /\$\{?([^$@#?\- \t{}:]+)\}?/g;
  let result = "";
  let startIndex = 0;
  do {
    const match = dollarExpressions.exec(value);
    if (match) {
      const betweenMatches = value.substring(startIndex, match.index) || "";
      result += betweenMatches + "%" + match[1] + "%";
      startIndex = dollarExpressions.lastIndex;
    }
  } while (dollarExpressions.lastIndex > 0);
  result += value.slice(startIndex);
  return result;
};

const rm = (path) => unlink(path).catch(() => {});

const cmdShim = (from, to) => stat(from).then(() => cmdShim_(from, to));

const cmdShim_ = (from, to) =>
  Promise.all([rm(to), rm(to + ".cmd"), rm(to + ".ps1")]).then(() =>
    writeShim(from, to)
  );

const writeShim = (from, to) =>
  mkdir(dirname(to), { recursive: true })
    .then(() => readFile(from, "utf8"))
    .then(
      (data) => {
        const firstLine = data.trim().split(/\r*\n/)[0];
        const shebang = firstLine.match(shebangExpr);
        if (!shebang) {
          return writeShim_(from, to);
        }
        const vars = shebang[1] || "";
        const prog = shebang[2];
        const args = shebang[3] || "";
        return writeShim_(from, to, prog, args, vars);
      },
      (er) => writeShim_(from, to)
    );

const writeShim_ = (from, to, prog, args, variables) => {
  let shTarget = relative(dirname(to), from);
  let target = shTarget.split("/").join("\\");
  let longProg;
  let shProg = prog && prog.split("\\").join("/");
  let shLongProg;
  let pwshProg = shProg && `"${shProg}$exe"`;
  let pwshLongProg;
  shTarget = shTarget.split("\\").join("/");
  args = args || "";
  variables = variables || "";
  if (!prog) {
    prog = `"%dp0%\\${target}"`;
    shProg = `"$basedir/${shTarget}"`;
    pwshProg = shProg;
    args = "";
    target = "";
    shTarget = "";
  } else {
    longProg = `"%dp0%\\${prog}.exe"`;
    shLongProg = `"$basedir/${prog}"`;
    pwshLongProg = `"$basedir/${prog}$exe"`;
    target = `"%dp0%\\${target}"`;
    shTarget = `"$basedir/${shTarget}"`;
  }

  // Subroutine trick to fix https://github.com/npm/cmd-shim/issues/10
  // and https://github.com/npm/cli/issues/969
  const head =
    "@ECHO off\r\n" +
    "GOTO start\r\n" +
    ":find_dp0\r\n" +
    "SET dp0=%~dp0\r\n" +
    "EXIT /b\r\n" +
    ":start\r\n" +
    "SETLOCAL\r\n" +
    "CALL :find_dp0\r\n";

  let cmd;
  if (longProg) {
    shLongProg = shLongProg.trim();
    args = args.trim();
    const variablesBatch = convertToSetCommands(variables);
    cmd =
      head +
      variablesBatch +
      "\r\n" +
      `IF EXIST ${longProg} (\r\n` +
      `  SET "_prog=${longProg.replace(/(^")|("$)/g, "")}"\r\n` +
      ") ELSE (\r\n" +
      `  SET "_prog=${prog.replace(/(^")|("$)/g, "")}"\r\n` +
      "  SET PATHEXT=%PATHEXT:;.JS;=;%\r\n" +
      ")\r\n" +
      "\r\n" +
      // prevent "Terminate Batch Job? (Y/n)" message
      // https://github.com/npm/cli/issues/969#issuecomment-737496588
      "endLocal & goto #_undefined_# 2>NUL || title %COMSPEC% & " +
      `"%_prog%" ${args} ${target} %*\r\n`;
  } else {
    cmd = `${head}${prog} ${args} ${target} %*\r\n`;
  }

  let sh = "#!/bin/sh\n";

  sh =
    sh +
    `basedir=$(dirname "$(echo "$0" | sed -e 's,\\\\,/,g')")\n` +
    "\n" +
    "case `uname` in\n" +
    '    *CYGWIN*|*MINGW*|*MSYS*) basedir=`cygpath -w "$basedir"`;;\n' +
    "esac\n" +
    "\n";

  if (shLongProg) {
    sh =
      sh +
      `if [ -x ${shLongProg} ]; then\n` +
      `  exec ${variables}${shLongProg} ${args} ${shTarget} "$@"\n` +
      "else \n" +
      `  exec ${variables}${shProg} ${args} ${shTarget} "$@"\n` +
      "fi\n";
  } else {
    sh = sh + `exec ${shProg} ${args} ${shTarget} "$@"\n`;
  }

  // exit $ret
  let pwsh =
    "#!/usr/bin/env pwsh\n" +
    "$basedir=Split-Path $MyInvocation.MyCommand.Definition -Parent\n" +
    "\n" +
    '$exe=""\n' +
    'if ($PSVersionTable.PSVersion -lt "6.0" -or $IsWindows) {\n' +
    "  # Fix case when both the Windows and Linux builds of Node\n" +
    "  # are installed in the same directory\n" +
    '  $exe=".exe"\n' +
    "}\n";
  if (shLongProg) {
    pwsh =
      pwsh +
      "$ret=0\n" +
      `if (Test-Path ${pwshLongProg}) {\n` +
      "  # Support pipeline input\n" +
      "  if ($MyInvocation.ExpectingInput) {\n" +
      `    $input | & ${pwshLongProg} ${args} ${shTarget} $args\n` +
      "  } else {\n" +
      `    & ${pwshLongProg} ${args} ${shTarget} $args\n` +
      "  }\n" +
      "  $ret=$LASTEXITCODE\n" +
      "} else {\n" +
      "  # Support pipeline input\n" +
      "  if ($MyInvocation.ExpectingInput) {\n" +
      `    $input | & ${pwshProg} ${args} ${shTarget} $args\n` +
      "  } else {\n" +
      `    & ${pwshProg} ${args} ${shTarget} $args\n` +
      "  }\n" +
      "  $ret=$LASTEXITCODE\n" +
      "}\n" +
      "exit $ret\n";
  } else {
    pwsh =
      pwsh +
      "# Support pipeline input\n" +
      "if ($MyInvocation.ExpectingInput) {\n" +
      `  $input | & ${pwshProg} ${args} ${shTarget} $args\n` +
      "} else {\n" +
      `  & ${pwshProg} ${args} ${shTarget} $args\n` +
      "}\n" +
      "exit $LASTEXITCODE\n";
  }

  return Promise.all([
    writeFile(to + ".ps1", pwsh, "utf8"),
    writeFile(to + ".cmd", cmd, "utf8"),
    writeFile(to, sh, "utf8"),
  ]).then(() => chmodShim(to));
};

const chmodShim = (to) =>
  Promise.all([
    chmod(to, 0o755),
    chmod(to + ".cmd", 0o755),
    chmod(to + ".ps1", 0o755),
  ]);

exports.ifExists = (from, to) =>
  stat(from).then(
    () => cmdShim(from, to),
    () => {}
  );
