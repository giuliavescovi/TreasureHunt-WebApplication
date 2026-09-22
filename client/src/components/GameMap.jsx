import mapImage from '../assets/mappa_tesoro.png';
import './GamePage.css'

function GameMap(props) {
    const polylinePoints = props.points.map(p => `${p.x},${p.y}`).join(' ');

    return (
        <div className="position-relative w-100" style={{ aspectRatio: '1 / 1' }}>
            <img
                src={mapImage}
                alt="Mappa del tesoro"
                className="w-100 h-100 border rounded"
                style={{ objectFit: 'contain' }}
            />

            {/* Linea tratteggiata che collega i luoghi visitati */}
            <svg viewBox="0 0 100 100" className="position-absolute top-0 start-0 w-100 h-100">
                <polyline
                    points={polylinePoints}
                    fill="none"
                    stroke="#5c3a21"
                    strokeWidth="0.6"
                    strokeDasharray="2,2"
                />
            </svg>

            {props.points.map(p => {
                const isTreasure = p.pathOrder === props.pathLength - 1;
                return (
                    <div
                        key={p.idLocation}
                        className="position-absolute text-center"
                        style={{ left: `${p.x}%`, top: `${p.y}%`, transform: 'translate(-50%, -100%)' }}
                    >
                        {isTreasure
                            ? <i className="bi bi-x-lg icon-x-red" />
                            : <i className="bi bi-geo-fill icon-pin-black" />}
                        <div className="map-label bg-white bg-opacity-90 rounded px-1">{p.name}</div>
                    </div>
                );
            })}
        </div>
    );
}

export default GameMap;
