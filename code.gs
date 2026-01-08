const SHEET_ID = "1hrfRLdweyuTrxT3snb_0oAQnUi-VX73S1iD2PeM2_zk";

function doGet() {
    return HtmlService
        .createHtmlOutputFromFile("index")
        .setTitle("Student Wellbeing System");
}

function saveData(data) {
    if (!data) {
        throw new Error("No data received");
    }

    if (data.consent !== "Yes") {
        return {
            riskLevel: "No Consent",
            riskPercentage: 0,
            message: "Consent not provided. Assessment not performed.",
            responses: {}
        };
    }

    const sheet = SpreadsheetApp
        .openById(SHEET_ID)
        .getSheets()[0];

    const sad = Number(data.sadLow);
    const academic = Number(data.academicStress);
    const satisfaction = Number(data.satisfaction);
    const lonely = Number(data.lonely);
    const exhausted = Number(data.exhausted);
    const hopeful = Number(data.hopeful);
    const sleep = Number(data.sleep);
    const mood = data.mood ? Number(data.mood) : null; // optional

    const hopefulRev = 6 - hopeful;
    const sleepRev = 6 - sleep;

    const riskScore =
        sad +
        academic +
        lonely +
        exhausted +
        hopefulRev +
        sleepRev +
        (mood || 0);

    const maxScore = 35;
    const riskPercentage = Math.round((riskScore / maxScore) * 100);

    let riskLevel = "Low";
    let message =
        "You appear to be coping well overall. Maintain healthy routines and social connections.";

    if (riskPercentage >= 40 && riskPercentage < 70) {
        riskLevel = "Moderate";
        message =
            "You may be experiencing noticeable stress. Consider talking to someone you trust.";
    }

    if (riskPercentage >= 70) {
        riskLevel = "High";
        message =
            "High stress detected. Please seek immediate emotional or professional support.";
    }

    sheet.appendRow([
        new Date(),
        data.studentId,
        data.consent,
        sad,
        academic,
        satisfaction,
        lonely,
        exhausted,
        hopeful,
        sleep,
        mood,
        riskScore,
        riskPercentage,
        riskLevel
    ]);

    return {
        riskLevel,
        riskPercentage,
        message,
        responses: {
            Sad: sad,
            Academic: academic,
            Satisfaction: satisfaction,
            Lonely: lonely,
            Exhausted: exhausted,
            Hopeful: hopeful,
            Sleep: sleep,
            Mood: mood
        }
    };
}
