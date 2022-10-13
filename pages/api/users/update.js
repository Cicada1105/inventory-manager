//import mongoClient, { ObjectId } from "../../../utils/mongodb.js"

export default async function handler(req,res) {
	if (req.methd === "POST") {
		console.log(req.body);

		res.redirect(307,"/users/list");
	}
}