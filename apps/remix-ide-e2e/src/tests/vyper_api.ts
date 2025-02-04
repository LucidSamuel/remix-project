'use strict'
import { NightwatchBrowser } from 'nightwatch'
import init from '../helpers/init'

declare global {
  interface Window { testplugin: { name: string, url: string }; }
}

module.exports = {
  '@disabled': true,
  before: function (browser: NightwatchBrowser, done: VoidFunction) {
    init(browser, done, null, true, { name: 'vyper', url: 'http://127.0.0.1:5002'})
  },

  'Should connect to vyper plugin #group1': function (browser: NightwatchBrowser) {
    browser.clickLaunchIcon('pluginManager')
      .scrollAndClick('[data-id="pluginManagerComponentActivateButtonvyper"]')
      .clickLaunchIcon('vyper')
      .pause(5000)
      // @ts-ignore
      .frame(0)
  },

  'Should add the Ballot.vy #group1': function (browser: NightwatchBrowser) {
    browser.click('button[data-id="add-ballot"]')
      .frameParent()
      .openFile('ballot.vy')
  },

  'Compile ballot.vy should error #group1': function (browser: NightwatchBrowser) {
    browser.clickLaunchIcon('vyper')
      // @ts-ignore
      .frame(0)
      .click('[data-id="remote-compiler"]')
      .click('[data-id="compile"]')
      .assert.containsText('[data-id="error-message"]', 'unexpected indent')
  },

  'Compile test contract should success #group1': function (browser: NightwatchBrowser) {
    let contractAddress
    browser
      .frameParent()
      .addFile('test.vy', { content: testContract })
      .clickLaunchIcon('vyper')
      // @ts-ignore
      .frame(0)
      .click('[data-id="compile"]')
      .frameParent()
      .clickLaunchIcon('udapp')
      .createContract('')
      .clickInstance(0)
      .clickFunction('totalPokemonCount - call')
      .getAddressAtPosition(0, (address) => {
        console.log('Vyper contract ' + address)
        contractAddress = address
      })
      .perform((done) => {
        browser.verifyCallReturnValue(contractAddress, ['0:uint256: 0'])
          .perform(() => done())
      })
  }
}

const testContract = `
# @version >=0.2.4 <0.3.0

DNA_DIGITS: constant(uint256) = 16
DNA_MODULUS: constant(uint256) = 10 ** DNA_DIGITS
# add HP_LIMIT

struct Pokemon:
    name: String[32]
    dna: uint256
    HP: uint256
    matches: uint256
    wins: uint256

totalPokemonCount: public(uint256)
pokemonList: HashMap[uint256, Pokemon]

@pure
@internal
def _generateRandomDNA(_name: String[32]) -> uint256:
    random: uint256 = convert(keccak256(_name), uint256)
    return random % DNA_MODULUS
# modify _createPokemon
@internal
def _createPokemon(_name: String[32], _dna: uint256, _HP: uint256):
    self.pokemonList[self.totalPokemonCount] = Pokemon({
        name: _name,
        dna: _dna,
        HP: _HP,
        matches: 0,
        wins: 0
    })
    self.totalPokemonCount += 1`