const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const multer = require("../middleware/multer-config");

const sauceCtrl = require("../controllers/sauce");

router.get("/sauces", auth, sauceCtrl.getAllSauces);
router.post("/sauces", auth, multer, sauceCtrl.createSauce);
router.get("/sauces/:id", auth, sauceCtrl.getOneSauce);
router.put("/sauces/:id", auth, multer, sauceCtrl.modifySauce);
router.delete("/sauces/:id", auth, sauceCtrl.deleteSauce);
// for likes route
router.post("/sauces/:id/like", auth, sauceCtrl.createSauce);

// --------------------
module.exports = router;
