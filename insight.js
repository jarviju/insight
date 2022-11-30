
class Insight {
	insight_data = {};
	headers = [];
	rows = [];

	div;

	config;
	config_default;

	constructor(div, data, config) {
		const self = this;
		this.div = div;

		self.config = config || {};

		self.config['settings'] = {};
		self.config['settings']['display'] = true;

		self.config['filters'] = {};
		self.config['filters']['master'] = '';
		self.config['filters']['cols'] = [];

		self.config['pivot'] = {};
		self.config['pivot']['display'] = true;
		self.config['pivot']['calculation'] = ['count', 0];
		self.config['pivot']['rows'] = [];
		self.config['pivot']['cols'] = [];
		self.config['pivot']['sort_row'] = ['key', 'asc']; // 'key', 'asc', 'value', 'asc'
		self.config['pivot']['sort_col'] = ['key', 'asc']; // key, value

		self.config['table'] = {};
		self.config['table']['display'] = true;
		self.config['table']['paging_size'] = 100;
		self.config['table']['sort'] = []; // 0, 'asc'
		self.config['table']['drilldown'] = [];

		this.config_default = JSON.parse(JSON.stringify(self.config));

		// Local storage
		// if (localStorage.hasOwnProperty('insight_config'))
		// {
		// 	self.config = JSON.parse(localStorage.getItem('insight_config'));
		// 	setTimeout(function() {
		// 		self.element("insight_master_search").value = self.config['filters']['master'];
		// 	}, 50);
		// }


		// let data = this.responseText;
		let input = data.toString().split("\n"); input.pop();
		self.insight_data['headers'] = input.shift().split("|");
		self.insight_data['rows'] = []; for (let i = 0; i < input.length; i++) { self.insight_data['rows'][i] = input[i].split("|"); }

		// Render Skeleton
		let html = '';
		document.getElementById(div).innerHTML = `
		<div class="insight_container">
			<div class="insight_settings_container">
				<div class="insight_settings_pivot">
					<label class="insight_settings_pivot_labels">Calculation:</label><br>
					<select class="insight_settings_pivot_calculation_formula insight_settings_pivot_select">
						<option value="count">Count</option>
						<option value="sum">Sum</option>
						<option value="average">Average</option>
					</select><br>
					<select class="insight_settings_pivot_calculation_value insight_settings_pivot_select"></select><br>
					<label class="insight_settings_pivot_labels">Columns:</label><br>
					<select class="insight_settings_pivot_cols1 insight_settings_pivot_select"></select><br>
					<select class="insight_settings_pivot_cols2 insight_settings_pivot_select"></select><br>
					<label class="insight_settings_pivot_labels">Rows:</label><br>
					<select class="insight_settings_pivot_rows1 insight_settings_pivot_select"></select><br>
					<select class="insight_settings_pivot_rows2 insight_settings_pivot_select"></select><br>
				</div>
				<div class="insight_table_settings"></div>
			</div>
			<div class="insight_top_container">
				<button class="insight_visibility_button_settings insight_button">Settings</button>
				<button class="insight_visibility_button_pivot insight_button">Pivot</button>
				<button class="insight_visibility_button_table insight_button">Table</button>
				<button class="insight_settings_button_restore insight_button">Restore</button>
				<input class="insight_master_search" placeholder="Search.."></input>
			</div>
			<div class="insight_pivot_container"><table class="insight_pivot"></table></div>
			<div class="insight_table_container"><table class="insight_table"></table></div>
		</div>
		`;
	
		// Button restore
		this.element('insight_settings_button_restore').onclick = function() {
			self.config = JSON.parse(JSON.stringify(self.config_default));
			self.element("insight_master_search").value = "";
			for (let i = 1; i <= 2; i++)
			{
				self.element("insight_settings_pivot_cols" + i).value = '';
				self.element("insight_settings_pivot_rows" + i).value = '';
			}
			localStorage.removeItem('insight_config');
			self.render();
		}
	
		// Visibility interactivity
		self.element("insight_visibility_button_settings").onclick = function() { if (self.config['settings']['display']) { self.config['settings']['display'] = false; } else { self.config['settings']['display'] = true; } self.render(); }
		self.element("insight_visibility_button_pivot").onclick = function() { if (self.config['pivot']['display']) { self.config['pivot']['display'] = false; } else { self.config['pivot']['display'] = true; } self.render(); }
		self.element("insight_visibility_button_table").onclick = function() { if (self.config['table']['display']) { self.config['table']['display'] = false; } else { self.config['table']['display'] = true; } self.render(); }
	
		// Load pivot
		html = '<option selected value></option>'; for (let i = 0; i < self.insight_data['headers'].length; i++) { html += '<option value="' + i + '">' + self.insight_data['headers'][i] + '</option>'; }
		self.element("insight_settings_pivot_calculation_formula").value = self.config['pivot']['calculation'][0];
		self.element("insight_settings_pivot_calculation_value").innerHTML = html;
		self.element("insight_settings_pivot_calculation_value").value = self.config['pivot']['calculation'][1]-1;
		self.element("insight_settings_pivot_calculation_formula").onchange = function() { self.config['pivot']['calculation'][0] = self.element("insight_settings_pivot_calculation_formula").value; self.render(); };
		self.element("insight_settings_pivot_calculation_value").onchange = function() { self.config['pivot']['calculation'][1] = Number(self.element("insight_settings_pivot_calculation_value").value)+1; self.render(); };
		for (let i = 1; i <= 2; i++)
		{
			self.element("insight_settings_pivot_cols" + i).innerHTML = html;
			self.element("insight_settings_pivot_cols" + i).value = self.config['pivot']['cols'][(i-1)];
			self.element("insight_settings_pivot_rows" + i).innerHTML = html;
			self.element("insight_settings_pivot_rows" + i).value = self.config['pivot']['rows'][(i-1)];
			self.element("insight_settings_pivot_cols" + i).onchange = function() {
				let pivot_cols = [];
				for (let i = 1; i <= 2; i++)
				{
					let arvo = self.element("insight_settings_pivot_cols" + i).value;
					if (arvo != '') { pivot_cols.push(arvo); }
				}
				self.config['pivot']['cols'] = pivot_cols;
				self.render();
			};
			self.element("insight_settings_pivot_rows" + i).onchange = function() {
				let pivot_rows = [];
				for (let i = 1; i <= 2; i++)
				{
					let arvo = self.element("insight_settings_pivot_rows" + i).value;
					if (arvo != '') { pivot_rows.push(arvo); }
				}
				self.config['pivot']['rows'] = pivot_rows;
				self.render();
			};
		}

		// Load table
		html = '';
		html += "<thead><tr>";
		for (let i = 0; i < self.insight_data['headers'].length; i++)
		{
			html += '<th class="insight_table_th_' + i + '">' + self.insight_data['headers'][i] + '</th>';
		}
		html += "</tr></thead>";
		html += '<tbody class="insight_table_body"></tbody>';
		self.element("insight_table").innerHTML = html;
	
		// Table sorting
		for (let i = 0; i < self.insight_data['headers'].length; i++)
		{
			self.element("insight_table_th_" + i).onclick = function() {
				if (this.classList.contains("insight_icon_desc")) { self.config['table']['sort'] = [i, 'asc']; }
				else { this.classList.add("insight_icon_desc"); self.config['table']['sort'] = [i, 'desc']; }
				self.render();
			};
		}
	
		// Initial results render
		self.render();
	
		// Search box
		self.element("insight_master_search").onkeyup = function() {
			self.config['filters']['master'] = self.element("insight_master_search").value.toLowerCase();

			self.render();
		};
	}

	render() {
		const self = this;

		// Variables
		const filters_master = self.config['filters']['master'];
		const headers = self.insight_data['headers'];
		self.rows = [];

		// Filters
		if (filters_master != "") { 
			for (let i = 0; i < self.insight_data['rows'].length; i++) {
				if (self.insight_data['rows'][i].join().toLowerCase().includes(filters_master)) { self.rows.push(self.insight_data['rows'][i]); } 
			}
		}
		else { self.rows = self.insight_data['rows']; }

		// Visibility
		if (self.config['settings']['display']) { self.element("insight_settings_container").style.display = "block"; } else { self.element("insight_settings_container").style.display = "none"; }
		if (self.config['pivot']['display']) { self.element("insight_pivot_container").style.display = "block"; } else { self.element("insight_pivot_container").style.display = "none"; }
		if (self.config['table']['display']) { self.element("insight_table_container").style.display = "block"; } else { self.element("insight_table_container").style.display = "none"; }

		// Local Storage
		// console.log(self.config);
		// window.localStorage.setItem('insight_config', JSON.stringify(self.config));

		setTimeout(function() {
			self.render_pivot();
			self.render_table();
		}, 50);
	}

	render_pivot() {
		const self = this;

		// Variables
		let pivot_rows = self.config['pivot']['rows'];
		let pivot_cols = self.config['pivot']['cols'];

		let pivot_formula = self.config['pivot']['calculation'][0];
		let pivot_value = self.config['pivot']['calculation'][1] - 1;

		let sort_col = self.config['pivot']['sort_col'][0];
		let sort_col_order = self.config['pivot']['sort_col'][1];
		let sort_row = self.config['pivot']['sort_row'][0];
		let sort_row_order = self.config['pivot']['sort_row'][1];

		// TODO merge with lower calculations
		let grand_total = 0;
		if (pivot_formula == 'count') { grand_total = self.rows.length; }
		if (pivot_formula == 'sum') { for (let i = 0; i < self.rows.length; i++) { grand_total += Number(self.rows[i][pivot_value]); } }
		if (pivot_formula == 'average') { let row_count = self.rows.length; let row_sum = 0; for (let i = 0; i < self.rows.length; i++) { row_sum += Number(self.rows[i][pivot_value]); } grand_total = Math.round((row_sum / row_count)); }

		let html = '';
		if (pivot_rows.length == 0 && pivot_cols.length == 0) // Nothing selected
		{
			html = '<tfoot><tr><th>Totals</th><td>' + grand_total + '</td></tr></tfoot>'
			self.element("insight_pivot").innerHTML = html;
		}
		else if (pivot_rows.length == 0 && pivot_cols.length > 0) // Cols selected
		{
			let keys_cols = {}; let totals_cols = [];
			for (let i = 0; i < self.rows.length; i++)
			{
				let key_array = []; for (let i2 = 0; i2 < pivot_cols.length; i2++) { key_array.push(self.rows[i][pivot_cols[i2]]); }
				let key = key_array.join('|');
				if (keys_cols[key]) { keys_cols[key][0] += 1; keys_cols[key][1] += Number(self.rows[i][pivot_value]); } else { keys_cols[key] = []; keys_cols[key][0] = 1; keys_cols[key][1] = Number(self.rows[i][pivot_value]); }
			}
			if (pivot_formula == 'count') { for (const [key, value] of Object.entries(keys_cols)) { totals_cols.push({key: key, value: value[0]}) } }
			if (pivot_formula == 'sum') { for (const [key, value] of Object.entries(keys_cols)) { totals_cols.push({key: key, value: value[1]}) } }
			if (pivot_formula == 'average') { for (const [key, value] of Object.entries(keys_cols)) { totals_cols.push({key: key, value: Math.round((value[1]/value[0]))}) } }
			// console.log(totals_cols); console.log(keys_cols);

			// Sorting
			if (sort_row_order == "asc") { totals_cols.sort(function(a,b) { if (!isNaN(a[sort_row]) && !isNaN(b[sort_row])) { return Number(a[sort_row]) > Number(b[sort_row]) ? 1 : -1; } else { return a[sort_row] > b[sort_row] ? 1 : -1; } }); }
			if (sort_row_order == "desc") { totals_cols.sort(function(a,b) { if (!isNaN(a[sort_row]) && !isNaN(b[sort_row])) { return Number(a[sort_row]) < Number(b[sort_row]) ? 1 : -1; } else { return a[sort_row] < b[sort_row] ? 1 : -1; } }); }

			// Render
			html += '<thead>'
			for (let i = 0; i < pivot_cols.length; i++)
			{
				html += '<tr>'
				html += '<th>' + self.insight_data['headers'][pivot_cols[i]] + '</th>'
				let colspan = 1;
				for (let i2 = 0; i2 < totals_cols.length; i2++)
				{
					if (totals_cols[i2+1])
					{
						if (totals_cols[i2]['key'].split('|')[i] != totals_cols[i2+1]['key'].split('|')[i])
						{
							html += '<th colspan=' + colspan + '>' + totals_cols[i2]['key'].split('|')[i] + '</th>';
							colspan = 1;
						}
						else { colspan++; }
					}
					else { html += '<th colspan=' + colspan + '>' + totals_cols[i2]['key'].split('|')[i] + '</th>'; }
				}
				if (i == 0) { html += '<th class="label_col_totals" rowspan="' + pivot_cols.length + '">Totals</th>' }
				html += '</tr>'
			}
			html += '</thead>'
			html += '<tfoot><tr>';
			let sort_class = ''; if (sort_row == 'value' && sort_row_order == 'asc') { sort_class = 'insight_icon_asc'; } else if (sort_row == 'value' && sort_row_order == 'desc') { sort_class = 'insight_icon_desc'; }
			html += '<th class="label_row_totals ' + sort_class + '">Totals</th>'
			for (let i = 0; i < totals_cols.length; i++)
			{
				let drilldown = [];
				let keys = totals_cols[i]['key'].split('|');
				for (let i2 = 0; i2 < pivot_cols.length; i2++) { drilldown.push([pivot_cols[i2], keys[i2]]) }
				html += "<td class='cell_value' data-drilldown='" + JSON.stringify(drilldown) + "'>" + totals_cols[i]['value'] + '</td>'; 
			}
			html += '<th>' + grand_total + '</th>'
			html += '</tr></tfoot>';
			self.element("insight_pivot").innerHTML = html;
		}
		else if (pivot_rows.length > 0 && pivot_cols.length == 0) // Rows selected
		{
			let keys_rows = {}; let totals_rows = [];
			for (let i = 0; i < self.rows.length; i++)
			{
				let key_array = []; for (let i2 = 0; i2 < pivot_rows.length; i2++) { key_array.push(self.rows[i][pivot_rows[i2]]); }
				let key = key_array.join('|');
				if (keys_rows[key]) { keys_rows[key][0] += 1; keys_rows[key][1] += Number(self.rows[i][pivot_value]); } else { keys_rows[key] = []; keys_rows[key][0] = 1; keys_rows[key][1] = Number(self.rows[i][pivot_value]); }
			}
			if (pivot_formula == 'count') { for (const [key, value] of Object.entries(keys_rows)) { totals_rows.push({key: key, value: value[0]}) } }
			if (pivot_formula == 'sum') { for (const [key, value] of Object.entries(keys_rows)) { totals_rows.push({key: key, value: value[1]}) } }
			if (pivot_formula == 'average') { for (const [key, value] of Object.entries(keys_rows)) { totals_rows.push({key: key, value: Math.round((value[1]/value[0]))}) } }
			// console.log(totals_rows); console.log(keys_rows);

			// Sorting
			if (sort_col_order == "asc") { totals_rows.sort(function(a,b) { if (!isNaN(a[sort_col]) && !isNaN(b[sort_col])) { return Number(a[sort_col]) > Number(b[sort_col]) ? 1 : -1; } else { return a[sort_col] > b[sort_col] ? 1 : -1; } }); }
			if (sort_col_order == "desc") { totals_rows.sort(function(a,b) { if (!isNaN(a[sort_col]) && !isNaN(b[sort_col])) { return Number(a[sort_col]) < Number(b[sort_col]) ? 1 : -1; } else { return a[sort_col] < b[sort_col] ? 1 : -1; } }); }

			// Render
			html += '<thead><tr>';
			for (let i = 0; i < pivot_rows.length; i++) { html += '<th>' + self.insight_data['headers'][pivot_rows[i]] + '</th>'; }
			let sort_class = ''; if (sort_col == 'value' && sort_col_order == 'asc') { sort_class = 'insight_icon_asc'; } else if (sort_col == 'value' && sort_col_order == 'desc') { sort_class = 'insight_icon_desc'; }
			html += '<th class="label_col_totals ' + sort_class + '">Totals</th></tr></thead>'
			html += '<tbody>';
			let previous = [];
			let rowspan = 1;
			for (let i = 0; i < totals_rows.length; i++)
			{
				let drilldown = [];
				let keys = totals_rows[i]['key'].split('|'); // console.log(keys);
				for (let i2 = 0; i2 < pivot_rows.length; i2++) { drilldown.push([pivot_rows[i2], keys[i2]]) }
				html += '<tr>';
				for (let i2 = 0; i2 < keys.length; i2++)
				{
					// TODO Better rowspan calculation
					if ((i2+1) == keys.length) { html += '<th class="label_row" style="border-bottom: 0px;">' + keys[i2] + '</th>'; }
					else
					{
						if (previous[i2] == keys[i2]) { html += '<th class="label_row" style="border-top: 0px; border-bottom: 0px;"></th>'; }
						else { html += '<th class="label_row" style="border-bottom: 0px;">' + keys[i2] + '</th>'; }
					}
				}
				html += "<td class='cell_value' data-drilldown='" + JSON.stringify(drilldown) + "'>" + totals_rows[i]['value'] + '</td>';
				html += '</tr>';
				previous = keys;
			}
			html += '</tbody>';
			html += '<tfoot><tr><th class="label_row_totals" colspan=' + pivot_rows.length + '>Totals</th><td>' + grand_total + '</td></tr></tfoot>'
			self.element("insight_pivot").innerHTML = html;
		}
		else // Rows & Cols selected
		{
			// Rows
			let keys_rows = {}; let totals_rows = [];
			let keys_cols = {}; let totals_cols = [];
			let keys_matrix = {}; let matrix = {}; let pivot_matrix = pivot_rows.concat(pivot_cols);
			for (let i = 0; i < self.rows.length; i++)
			{
				let key_array;
				let key;

				// Rows
				key_array = []; for (let i2 = 0; i2 < pivot_rows.length; i2++) { key_array.push(self.rows[i][pivot_rows[i2]]); }
				key = key_array.join('|');
				if (keys_rows[key]) { keys_rows[key][0] += 1; keys_rows[key][1] += Number(self.rows[i][pivot_value]); } else { keys_rows[key] = []; keys_rows[key][0] = 1; keys_rows[key][1] = Number(self.rows[i][pivot_value]); }

				// Cols
				key_array = []; for (let i2 = 0; i2 < pivot_cols.length; i2++) { key_array.push(self.rows[i][pivot_cols[i2]]); }
				key = key_array.join('|');
				if (keys_cols[key]) { keys_cols[key][0] += 1; keys_cols[key][1] += Number(self.rows[i][pivot_value]); } else { keys_cols[key] = []; keys_cols[key][0] = 1; keys_cols[key][1] = Number(self.rows[i][pivot_value]); }

				// Data Matrix
				key_array = []; for (let i2 = 0; i2 < pivot_matrix.length; i2++) { key_array.push(self.rows[i][pivot_matrix[i2]]); }
				key = key_array.join('|');
				if (keys_matrix[key]) { keys_matrix[key][0] += 1; keys_matrix[key][1] += Number(self.rows[i][pivot_value]); } else { keys_matrix[key] = []; keys_matrix[key][0] = 1; keys_matrix[key][1] = Number(self.rows[i][pivot_value]); }
			}
			if (pivot_formula == 'count')
			{
				for (const [key, value] of Object.entries(keys_rows)) { totals_rows.push({key: key, value: value[0]}) }
				for (const [key, value] of Object.entries(keys_cols)) { totals_cols.push({key: key, value: value[0]}) }
				for (const [key, value] of Object.entries(keys_matrix)) { matrix[key] = value[0]; }
			}
			if (pivot_formula == 'sum')
			{
				for (const [key, value] of Object.entries(keys_rows)) { totals_rows.push({key: key, value: value[1]}) }
				for (const [key, value] of Object.entries(keys_cols)) { totals_cols.push({key: key, value: value[1]}) }
				for (const [key, value] of Object.entries(keys_matrix)) { matrix[key] = value[1]; }
			}
			if (pivot_formula == 'average')
			{
				for (const [key, value] of Object.entries(keys_rows)) { totals_rows.push({key: key, value: Math.round((value[1]/value[0]))}) }
				for (const [key, value] of Object.entries(keys_cols)) { totals_cols.push({key: key, value: Math.round((value[1]/value[0]))}) }
				for (const [key, value] of Object.entries(keys_matrix)) { matrix[key] = Math.round((value[1]/value[0])); }
			}
			// console.log(totals_rows); console.log(keys_rows);
			// console.log(totals_cols); console.log(keys_cols);
			// console.log(keys_matrix); console.log(matrix);

			// Sorting
			if (sort_col_order == "asc") { totals_rows.sort(function(a,b) { if (!isNaN(a[sort_col]) && !isNaN(b[sort_col])) { return Number(a[sort_col]) > Number(b[sort_col]) ? 1 : -1; } else { return a[sort_col] > b[sort_col] ? 1 : -1; } }); }
			if (sort_col_order == "desc") { totals_rows.sort(function(a,b) { if (!isNaN(a[sort_col]) && !isNaN(b[sort_col])) { return Number(a[sort_col]) < Number(b[sort_col]) ? 1 : -1; } else { return a[sort_col] < b[sort_col] ? 1 : -1; } }); }
			if (sort_row_order == "asc") { totals_cols.sort(function(a,b) { if (!isNaN(a[sort_row]) && !isNaN(b[sort_row])) { return Number(a[sort_row]) > Number(b[sort_row]) ? 1 : -1; } else { return a[sort_row] > b[sort_row] ? 1 : -1; } }); }
			if (sort_row_order == "desc") { totals_cols.sort(function(a,b) { if (!isNaN(a[sort_row]) && !isNaN(b[sort_row])) { return Number(a[sort_row]) < Number(b[sort_row]) ? 1 : -1; } else { return a[sort_row] < b[sort_row] ? 1 : -1; } }); }

			// Render
			html += '<thead>';
			for (let i = 0; i < pivot_cols.length; i++)
			{
				html += '<tr>';
				html += '<th class="label_col_names" colspan=' + pivot_rows.length + '>' + self.insight_data['headers'][pivot_cols[i]] + '</th>'
				let rowspan = 1; if (i+1 == pivot_cols.length) { rowspan = 2; }
				let colspan = 1;
				for (let i2 = 0; i2 < totals_cols.length; i2++)
				{
					if (totals_cols[i2+1])
					{
						if (totals_cols[i2]['key'].split('|')[i] != totals_cols[i2+1]['key'].split('|')[i])
						{
							html += '<th colspan=' + colspan + ' rowspan=' + rowspan + '>' + totals_cols[i2]['key'].split('|')[i] + '</th>';
							colspan = 1;
						}
						else { colspan++; }
					}
					else { html += '<th colspan=' + colspan + ' rowspan=' + rowspan + '>' + totals_cols[i2]['key'].split('|')[i] + '</th>'; }
				}
				let sort_class = ''; if (sort_col == 'value' && sort_col_order == 'asc') { sort_class = 'insight_icon_asc'; } else if (sort_col == 'value' && sort_col_order == 'desc') { sort_class = 'insight_icon_desc'; }
				if (i == 0) { html += '<th class="label_col_totals ' + sort_class + '" rowspan="' + (pivot_cols.length+1) + '">Totals</th>' }
				html += '</tr>';
			}
			html += '<tr>'
			for (let i = 0; i < pivot_rows.length; i++)
			{
				html += '<th class="label_row_names">' + self.insight_data['headers'][pivot_rows[i]] + '</th>';
			}
			html += '</tr>';
			html += '</thead>';
			html += '<tbody>';
			let previous = [];
			for (let i = 0; i < totals_rows.length; i++)
			{
				let keys = totals_rows[i]['key'].split('|');
				html += '<tr>';
				for (let i2 = 0; i2 < keys.length; i2++)
				{
					if ((i2+1) == keys.length) { html += '<th class="label_row" style="border-bottom: 0px;">' + keys[i2] + '</th>'; }
					else
					{
						if (previous[i2] == keys[i2]) { html += '<th class="label_row" style="border-top: 0px; border-bottom: 0px;"></th>'; }
						else { html += '<th class="label_row" style="border-bottom: 0px;">' + keys[i2] + '</th>'; }
					}
				}
				for (let i2 = 0; i2 < totals_cols.length; i2++)
				{
					let drilldown = [];
					let keys_rows = totals_rows[i]['key'].split('|');
					let keys_cols = totals_cols[i2]['key'].split('|');
					for (let i3 = 0; i3 < pivot_rows.length; i3++) { drilldown.push([pivot_rows[i3], keys_rows[i3]]) }
					for (let i3 = 0; i3 < pivot_cols.length; i3++) { drilldown.push([pivot_cols[i3], keys_cols[i3]]) }

					let matrix_key = totals_rows[i]['key'] + '|' + totals_cols[i2]['key'];
					let cell_value = ''; if (matrix[matrix_key]) { cell_value = matrix[matrix_key]; }
					if (cell_value != '') { html += "<td class='cell_value' data-drilldown='" + JSON.stringify(drilldown) + "'>" + cell_value + '</td>'; }
					else { html += '<td></td>'; }
				}

				let drilldown = [];
				for (let i2 = 0; i2 < pivot_rows.length; i2++) { drilldown.push([pivot_rows[i2], keys[i2]]) }
				html += "<th class='cell_value' data-drilldown='" + JSON.stringify(drilldown) + "'>" + totals_rows[i]['value'] + '</th>';
				html += '</tr>';
				previous = keys;
			}
			html += '</tbody>';
			html += '<tfoot><tr>';
			let sort_class = ''; if (sort_row == 'value' && sort_row_order == 'asc') { sort_class = 'insight_icon_asc'; } else if (sort_row == 'value' && sort_row_order == 'desc') { sort_class = 'insight_icon_desc'; }
			html += '<th class="label_row_totals ' + sort_class + '" colspan=' + pivot_rows.length + '>Totals</th>'
			for (let i = 0; i < totals_cols.length; i++)
			{
				let drilldown = [];
				let keys = totals_cols[i]['key'].split('|');
				for (let i2 = 0; i2 < pivot_cols.length; i2++) { drilldown.push([pivot_cols[i2], keys[i2]]) }
				html += "<th class='cell_value' data-drilldown='" + JSON.stringify(drilldown) + "'>" + totals_cols[i]['value'] + '</th>'; 
			}
			html += '<th>' + grand_total + '</th>'
			html += '</tr></tfoot>';
			self.element("insight_pivot").innerHTML = html;
		}

		// Sorting interactivity
		if (pivot_rows.length > 0 || pivot_cols.length > 0)
		{
			self.element("label_col_totals").onclick = function() {
				if (this.classList.contains("insight_icon_desc")) { self.config['pivot']['sort_col'] = ['value', 'asc']; }
				else if (this.classList.contains("insight_icon_asc")) { self.config['pivot']['sort_col'] = []; }
				else { self.config['pivot']['sort_col'] = ['value', 'desc']; }
				self.render();
			};
			self.element("label_row_totals").onclick = function() {
				if (this.classList.contains("insight_icon_desc")) { self.config['pivot']['sort_row'] = ['value', 'asc']; }
				else if (this.classList.contains("insight_icon_asc")) { self.config['pivot']['sort_row'] = []; }
				else { self.config['pivot']['sort_row'] = ['value', 'desc']; }
				self.render();
			};
		}

		// Pivot drilldown interactivity
		let cells = document.getElementsByClassName("cell_value");
		for(let i = 0; i < cells.length; i++)
		{
			cells[i].onclick = function ()
			{
				self.config['table']['drilldown'] = JSON.parse(this.dataset.drilldown);
				self.config['table']['display'] = true;
				self.render();
			}
		}
	}

	render_table() {
		const self = this;

		// Variables
		let sort_col = self.config['table']['sort'][0];
		let sort_order = self.config['table']['sort'][1];
		let drilldown = self.config['table']['drilldown'];

		// Header sort class
		for (let i = 0; i < self.insight_data['headers'].length; i++)
		{
			self.element("insight_table_th_" + i).classList.remove("insight_icon_asc");
			self.element("insight_table_th_" + i).classList.remove("insight_icon_desc");
		}
		if (self.config['table']['sort'].length > 0) { self.element("insight_table_th_" + sort_col).classList.add("insight_icon_" + sort_order); }

		// Sorting
		if (sort_order == 'asc') { self.rows.sort(function(a,b) { if (!isNaN(a[sort_col]) && !isNaN(b[sort_col])) { return Number(a[sort_col]) > Number(b[sort_col]) ? 1 : -1; } else { return a[sort_col] > b[sort_col] ? 1 : -1; }}); }
		if (sort_order == 'desc') { self.rows.sort(function(a,b) { if (!isNaN(a[sort_col]) && !isNaN(b[sort_col])) { return Number(a[sort_col]) < Number(b[sort_col]) ? 1 : -1; } else { return a[sort_col] < b[sort_col] ? 1 : -1; }}); }

		// Rendering
		let html = "";
		if (self.rows.length > 0)
		{
			let paging = 0;
			for (let i = 0; i < self.rows.length; i++)
			{
				// Drill Down handler
				let show = true;
				if (drilldown.length > 0)
				{
					for (let i2 = 0; i2 < drilldown.length; i2++)
					{
						if (self.rows[i][drilldown[i2][0]] != drilldown[i2][1]) { show = false; }
					}
				}
				if (show)
				{
					if (paging < self.config['table']['paging_size'])
					{
						html += "<tr><td>" + self.rows[i].join("</td><td>") + "</td></tr>";
						paging++;
					}
				}
			}
		}
		else { html = '<tr><td colspan="' + self.insight_data['headers'].length + '">No results</td></tr>' }
		self.element("insight_table_body").innerHTML = html;
	}

	element(selector) {
		return document.querySelector('#' + this.div).querySelector('.' + selector);
	}
	
	getConfig() {
		return this.config;
	}
}
