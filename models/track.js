const mongoose = require('mongoose');

const trackSchema = new mongoose.Schema({
    timestamp: { type: String, required: true },
    pageUrl: { type: String, required: true },
    referrer: { type: String, default: '' },
    screenResolution: { type: String, default: '' },
    deviceType: { type: String, default: '' },
    language: { type: String, default: '' },
    browser: { type: String, default: '' },
    utmParams: {
        utm_source: { type: String, default: null },
        utm_medium: { type: String, default: null },
        utm_campaign: { type: String, default: null }
    },
    timeOnPage: { type: Number, default: 0 },
    scrollDepth: { type: String, default: '' },
    ip: { type: String, default: '' },
    locationInfo: {
        city: { type: String, default: '' },
        region: { type: String, default: '' },
        country: { type: String, default: '' },
        loc: { type: String, default: '' },
        org: { type: String, default: '' },
        postal: { type: String, default: '' },
        timezone: { type: String, default: '' },
        bogon: { type: Boolean, default: false }
    }
});

const Track = mongoose.model('TrackInformation', trackSchema);

module.exports = Track;
