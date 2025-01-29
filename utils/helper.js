const admin = require('firebase-admin');
// const serviceAccount = require('../utils/serviceAccountKey.json');
// admin.initializeApp({
//     credential: admin.credential.cert(serviceAccount)
// });

exports.haversineDistance = async (coords1, coords2) => {
    const toRad = (value) => (value * Math.PI) / 180;
    const R = 6371; // Radius of the Earth in km
    const lat1 = coords1[0], lon1 = coords1[1];
    const lat2 = coords2[0], lon2 = coords2[1];

    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in km
    return distance;
};

exports.sendPushNotification = (token, message) => {
    const payload = {
        notification: {
            title: 'New Message',
            body: message,
        },
        token: token,
    };
    const response = admin.messaging().send(payload);
    const status = response.failureCount > 0 ? 'failed' : 'success';
    const responseText = JSON.stringify(response);
    if (status === 'failed') {
        const failedTokens = [];
        response.responses.forEach((resp, idx) => {
            if (!resp.success) {
                failedTokens.push(token);
            }
        });
    } else {
        return {
            success: true,
            message: 'Notification sent successfully',
            data: response,
        };
    }
}