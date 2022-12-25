const profileDB = require("../services/dbProfileService");

const pdf = require("pdfkit");

exports.buildPDF = async function buildPDF(dataCallback, endCallback, username) {
    try {
        const doc = new pdf({ bufferPages: true });
        let tmp = await profileDB.getSkillprofile(username);
        data = tmp.payload.pop();

        // Colors
        let headerColor = "#1d4d78";
        let defaultColor = "#000";
        let grey = "#a6a6a6";

        doc.on("data", dataCallback);
        doc.on("end", endCallback);

        // Titel
        doc
            .fontSize(20)
            .text(data.accountInfo.firstname + " " + data.accountInfo.surname + " - ", {
                continued: true
            })
            .fillColor(headerColor)
            .text(data.skillprofile.general.job);

        // General Information
        doc
            .fillColor(defaultColor)
            .fontSize(12)
            .text(
                "\nGeburtstag: " +
                data.accountInfo.birthday +
                "\nUnternehmen: " +
                data.skillprofile.general.company +
                "\nNationalität: " +
                data.skillprofile.general.nationality +
                "\nEmail: " +
                data.skillprofile.general.email +
                "\nTelefon: " +
                data.skillprofile.general.phone +
                "\nStandort: " +
                data.skillprofile.general.city
            );

        // Haupfähigkeiten
        doc.fillColor(headerColor).fontSize(16).text("\nHauptfähigkeiten\n\n", {
            align: "center"
        });

        doc.fillColor(defaultColor).fontSize(12).list(data.skillprofile.keyStrengths, {
            bulletRadius: 3
        });

        //Projects
        doc.fillColor(headerColor).fontSize(16).text("\nProjekte\n", {
            align: "center"
        });

        data.skillprofile.projects.forEach((element) => {
            doc
                .fillColor(defaultColor)
                .fontSize(14)
                .text("\n" + element.project, {
                    continued: true,
                    underline: true
                })
                .fillColor(grey)
                .text(" (" + element.start + " - " + element.end + ")\n", {
                    underline: false
                });

            doc
                .fillColor(defaultColor)
                .fontSize(12)
                .text(element.info + "\n");
        });

        //Skills
        doc.fillColor(headerColor).fontSize(16).text("\nSkills\n\n", {
            align: "center"
        });

        data.skillprofile.skills.forEach((element) => {
            doc
                .fillColor(defaultColor)
                .fontSize(12)
                .text(element.skill + ": " + element.rating);
        });

        //Qualifications
        doc.fillColor(headerColor).fontSize(16).text("\nQualifikationen\n\n", {
            align: "center"
        });

        data.skillprofile.qualifications.forEach((element) => {
            doc
                .fillColor(defaultColor)
                .fontSize(14)
                .text(element.place, {
                    continued: true,
                    underline: true
                })
                .fillColor(grey)
                .text(" (" + element.start + " - " + element.end + ")\n", {
                    underline: false
                });

            doc
                .fillColor(defaultColor)
                .fontSize(12)
                .text(element.info + "\n");
        });

        // Print of current day
        let today = new Date();
        let dd = String(today.getDate()).padStart(2, "0");
        let mm = String(today.getMonth()).padStart(2, "0");
        let yy = today.getFullYear();

        let datePrint = dd + "." + mm + "." + yy;

        doc
            .fillColor(defaultColor)
            .fontSize(8)
            .text("\nDas Profil wurde am " + datePrint + " exportiert.");

        doc.end();
    } catch (err) {
        console.log("PDF Export: " + err.code);
    }
}