import { assert, expect } from "chai";
import { network } from "hardhat";
import { SimpleStorage } from "../types/ethers-contracts/index.js";
import { SimpleStorage__factory } from "../types/ethers-contracts/index.js";
const { ethers } = await network.connect();

describe("SimpleStorage", function () {
    let simpleStorage: SimpleStorage;

    let SimpleStorageFactory: SimpleStorage__factory;

    beforeEach(async () => {
        SimpleStorageFactory = (await ethers.getContractFactory(
            "SimpleStorage",
        )) as SimpleStorage__factory;

        simpleStorage = await SimpleStorageFactory.deploy();
    });

    it("Should start with a favorite number of 0", async function () {
        let currentValue = await simpleStorage.retrieve();

        let expectedValue = "0";

        // expect(currentValue).to.equal(0);

        assert.equal(currentValue.toString(), expectedValue);
    });

    it("Should update when we call store", async function () {
        let expectedValue = "7";

        let transactionResponse = await simpleStorage.store(expectedValue);

        await transactionResponse.wait();

        let currentValue = await simpleStorage.retrieve();

        // expect(currentValue).to.equal(expectedValue);

        assert.equal(currentValue.toString(), expectedValue);
    });

    it("Should add a person to the people array", async () => {
        let name = "Bill";

        let favoriteNumber = "2";

        let transactionResponse = await simpleStorage.addPerson(
            name,
            favoriteNumber,
        );

        await transactionResponse.wait();

        let person = await simpleStorage.people(0);

        assert.equal(person.name, name);

        assert.equal(person.favoriteNumber.toString(), favoriteNumber);

        // Test that the mapping was updated
        let mappedFavoriteNumber =
            await simpleStorage.nameToFavoriteNumber(name);

        assert.equal(mappedFavoriteNumber.toString(), favoriteNumber);
    });

    it("Should add multiple people to the people array", async () => {
        let people = [
            { name: "Alice", favoriteNumber: "10" },
            { name: "Bob", favoriteNumber: "20" },
            { name: "Charlie", favoriteNumber: "30" },
        ];

        // Add all people
        for (let i = 0; i < people.length; i++) {
            let tx = await simpleStorage.addPerson(
                people[i].name,
                people[i].favoriteNumber,
            );
            await tx.wait();
        }

        // Verify all people were added correctly
        for (let i = 0; i < people.length; i++) {
            let person = await simpleStorage.people(i);
            assert.equal(person.name, people[i].name);
            assert.equal(
                person.favoriteNumber.toString(),
                people[i].favoriteNumber,
            );

            let mappedNumber = await simpleStorage.nameToFavoriteNumber(
                people[i].name,
            );
            assert.equal(mappedNumber.toString(), people[i].favoriteNumber);
        }
    });

    it("Should update mapping when adding person with same name", async () => {
        let name = "John";
        let firstFavoriteNumber = "5";
        let secondFavoriteNumber = "15";

        // Add person first time
        let tx1 = await simpleStorage.addPerson(name, firstFavoriteNumber);
        await tx1.wait();

        // Add same person again with different favorite number
        let tx2 = await simpleStorage.addPerson(name, secondFavoriteNumber);
        await tx2.wait();

        // Should have 2 entries in people array
        let person1 = await simpleStorage.people(0);
        let person2 = await simpleStorage.people(1);

        assert.equal(person1.name, name);
        assert.equal(person1.favoriteNumber.toString(), firstFavoriteNumber);
        assert.equal(person2.name, name);
        assert.equal(person2.favoriteNumber.toString(), secondFavoriteNumber);

        // But mapping should only have the latest value
        let mappedNumber = await simpleStorage.nameToFavoriteNumber(name);
        assert.equal(mappedNumber.toString(), secondFavoriteNumber);
    });

    it("Should return 0 for non-existent name in mapping", async () => {
        let nonExistentName = "NonExistent";
        let mappedNumber =
            await simpleStorage.nameToFavoriteNumber(nonExistentName);
        assert.equal(mappedNumber.toString(), "0");
    });
});
