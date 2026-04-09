const SurfaceFronts = require('./SurfaceFronts');
const plot_data = require('./plot_data');

function _remove_empty_strings_from_array(array) {
    return array.filter(line => { return line.trim() != '' });
}

function fetch_data() {
    fetch('/api/fronts')
    .then(response => {
        if (!response.ok) throw new Error(`Fronts request failed: ${response.status}`);
        return response.text();
    })
    .then(data => {
        var formatted_lines = _remove_empty_strings_from_array(data.replaceAll('\r', '').split('\n'));
        formatted_lines = formatted_lines.join('\n');

        const fronts = new SurfaceFronts(formatted_lines);
        console.log(fronts);
        plot_data(fronts);
    })
    .catch(err => {
        console.error('Failed to load surface fronts:', err);
    });
}

module.exports = fetch_data;