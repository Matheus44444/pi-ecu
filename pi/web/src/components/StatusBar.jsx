import React from "react";

function readValue(data, names, fallback = "—") {
    for (const name of names) {
        if (data && data[name] !== undefined && data[name] !== null) {
            return data[name];
        }
    }

    return fallback;
}

function StatusBar({ telemetry = {}, data = {} }) {
    const values = {
        rpm: readValue(telemetry, ["rpm"], readValue(data, ["rpm"], 0)),
        map: readValue(
            telemetry,
            ["map_kpa", "map"],
            readValue(data, ["map_kpa", "map"], 0)
        ),
        tps: readValue(
            telemetry,
            ["tps", "tps_pct"],
            readValue(data, ["tps", "tps_pct"], 0)
        ),
        lambda: readValue(
            telemetry,
            ["lambda1", "lambda"],
            readValue(data, ["lambda1", "lambda"], 0)
        ),
    };

    return (
        <section className="status-bar">
            <div className="status-item">
                <span>RPM</span>
                <strong>{Math.round(Number(values.rpm) || 0)}</strong>
            </div>

            <div className="status-item">
                <span>MAP</span>
                <strong>{Number(values.map) || 0} kPa</strong>
            </div>

            <div className="status-item">
                <span>TPS</span>
                <strong>{Number(values.tps) || 0}%</strong>
            </div>

            <div className="status-item">
                <span>LAMBDA</span>
                <strong>{Number(values.lambda || 0).toFixed(2)}</strong>
            </div>
        </section>
    );
}

export default StatusBar;