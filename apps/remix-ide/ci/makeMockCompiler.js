'use strict'

const fs = require('fs')
const compiler = require('solc')
const compilerInput = require('@remix-project/remix-solidity').CompilerInput
const defaultVersion = 'soljson-v0.8.7+commit.e28d00a7.js'
const path = require('path')

compiler.loadRemoteVersion(defaultVersion, (error, solcSnapshot) => {
  console.log('solcSnapshot: ', solcSnapshot)
  if (error) console.log(error)
  const compilationResult = {}
  const testsFolder = path.resolve(__dirname + '/../test-browser/tests/') + '/' // eslint-disable-line

  gatherCompilationResults(testsFolder, compilationResult, solcSnapshot)
  replaceSolCompiler(compilationResult, solcSnapshot)
})

function gatherCompilationResults (dir, compilationResult, solcSnapshot) {
  const filenames = fs.readdirSync(dir, 'utf8')
  filenames.map(function (item, i) {
    if (item.endsWith('.js')) {
      const testDef = require(dir + item)
      if ('@sources' in testDef) {
        const sources = testDef['@sources']()
        for (const files in sources) {
          compile(solcSnapshot, sources[files], true, function (result) {
            compilationResult[result.key] = result
          })
          compile(solcSnapshot, sources[files], false, function (result) {
            compilationResult[result.key] = result
          })
        }
      }
    }
  })
  return compilationResult
}

function compile (solcSnapshot, source, optimization, runs, addCompilationResult) {
  const missingInputs = []
  try {
    var input = compilerInput(source, { optimize: optimization, runs })
    var result = solcSnapshot.compileStandardWrapper(input, function (path) {
      missingInputs.push(path)
    })
    input = input.replace(/(\t)|(\n)|(\\n)|( )/g, '')
  } catch (e) {
    console.log(e)
  }
  if (result && (result.error || (result.errors && result.errors.length > 0))) {
    console.log(result.error, result.errors)
  }
  if (result) {
    console.log(result.error, result.errors)
  }
  const ret = {
    key: input,
    source,
    optimization,
    missingInputs,
    result
  }
  addCompilationResult(ret)
}

function replaceSolCompiler (results, solcSnapshot) {
  const compilerPath = path.resolve(__dirname + '/../test-browser/mockcompiler/compiler.js') // eslint-disable-line
  const soljsonPath = path.resolve(__dirname + '/../soljson.js') // eslint-disable-line

  fs.readFile(compilerPath, 'utf8', function (error, data) {
    if (error) {
      console.log(error)
      process.exit(1)
      return
    }
    console.log(solcSnapshot.version())
    data = data + '\n\nvar mockCompilerVersion = \'' + solcSnapshot.version() + '\''
    data = data + '\n\nvar mockData = ' + JSON.stringify(results) + ';\n'
    fs.writeFile(soljsonPath, data, 'utf8', function (error) {
      if (error) {
        console.log(error)
        process.exit(1)
      }
    })
  })
}
