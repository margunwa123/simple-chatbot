import { db } from "../database";

const userCollection = db.collection("user");

export default class User {
  public birthdate: Date | null;

  constructor(
    public name: string,
    birthdate: string | Date | null,
    public id: string | null
  ) {
    if (typeof birthdate === "string") {
      this.birthdate = new Date(birthdate);
    } else {
      this.birthdate = birthdate;
    }
  }

  static async getUserById(id: string): Promise<User> {
    const dbData = (await userCollection.doc(id).get()).data();
    if (!dbData) {
      throw "id not found";
    }
    return new User(dbData.name, dbData.birthdate, id);
  }

  async saveToDatabase() {
    const res = await userCollection.add({
      name: this.name,
      birthdate: this.birthdate,
    });
    return res.id;
  }
}
