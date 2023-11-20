		function updateGraph(){
		
		var choice= document.getElementById("opt1").value;
		
		switch(choice){
			case "0":
				
				var vendPerProvOnline= alasql('SELECT P.Desc_Provincia AS Provincia, ROUND(SUM(S.PrezzoScontrino),2) AS VenditeTotali  FROM Scontrino AS S JOIN Cliente AS C ON S.ID_Cliente = C.ID_Cliente LEFT JOIN Provincia AS P ON C.ID_Provincia = P.ID_Provincia GROUP BY P.Desc_Provincia ORDER BY Provincia DESC');
				var vendPerProv=alasql('SELECT P.Desc_Provincia AS Provincia, ROUND(SUM(S.PrezzoScontrino),2) AS VenditeTotali  FROM Scontrino AS S JOIN Negozio AS N ON S.Cod_Negozio = N.ID_Negozio LEFT JOIN Provincia AS P ON N.ID_Provincia = P.ID_Provincia GROUP BY P.Desc_Provincia ORDER BY Provincia DESC');

				var option1={
						tooltip: {
							trigger: 'axis',
							axisPointer: {
							type: 'shadow'
							},
							formatter: function(params) {
								var tooltipText = params[0].name + '<br/>'; 
								params.forEach(function(param) {
								  var value = param.value.toFixed(2);
								  tooltipText += param.seriesName + ': ' + value + ' \u20AC<br/>';
								});
								return tooltipText;
							  },
						},
						title: {text: 'Vendite per provincia'},
						xAxis: {},
						yAxis: {data: (vendPerProv.map(item => item.Provincia).length > vendPerProvOnline.map(item => item.Provincia).length ? vendPerProv.map(item => item.Provincia) : vendPerProvOnline.map(item => item.Provincia)) },
						legend: {left: '70%'},
						series: [{
							name: 'Negozio',
							type: 'bar',
							color: '#0218bd',
							data: vendPerProv.map(item => item.VenditeTotali),
							
						},
						{
							name: 'Online',
							type: 'bar',
							color: '#02bcd1',
							data: vendPerProvOnline.map(item => item.VenditeTotali)
						}
						]
						
					};
				myChart.setOption(option1, true);
				break;

			case "1":
				
			var vendPerCatOnline=alasql ('SELECT C.Desc_Categoria AS Categoria, COUNT(A.ID_Articolo) AS VenditeTotali FROM Categoria AS C JOIN Articolo AS A ON C.ID_Categoria = A.ID_Categoria  JOIN Scontrino AS S ON A.ID_Scontrino = S.ID_Scontrino WHERE A.ID_Scontrino > 0 AND S.Flag_Online = true GROUP BY C.Desc_Categoria ORDER BY VenditeTotali DESC');
			var vendPerCatOffline=alasql ('SELECT C.Desc_Categoria AS Categoria, COUNT(A.ID_Articolo) AS VenditeTotali FROM Categoria AS C JOIN Articolo AS A ON C.ID_Categoria = A.ID_Categoria  JOIN Scontrino AS S ON A.ID_Scontrino = S.ID_Scontrino WHERE A.ID_Scontrino > 0 AND S.Flag_Online = false GROUP BY C.Desc_Categoria ORDER BY VenditeTotali DESC');
			

			var warmColors = ['#f03a3a', '#f0643a', '#f0893a', '#f0ad3a'];
			var coolColors = ['#493ae8', '#3a63e8', '#118cd9', '#11b8d9'];

			var data = [];

			var offlineData = vendPerCatOffline.map(function(item, index) {
			return {
				name: item.Categoria + ' (Negozio)',
				value: item.VenditeTotali,
				itemStyle: {
				color: warmColors[index % warmColors.length]
				}
			};
			});

			var onlineData = vendPerCatOnline.map(function(item, index) {
			return {
				name: item.Categoria + ' (Online)',
				value: item.VenditeTotali,
				itemStyle: {
				color: coolColors[index % coolColors.length]
				}
			};
			});

			offlineData.sort(function (a, b) {
			return b.value - a.value;
			});

			onlineData.sort(function (a, b) {
			return b.value - a.value;
			});

			data = offlineData.concat(onlineData);

			var option2 = {
				title: {
					text: 'Numero vendite per categorie merceologiche',
					left: 'center'
				},
				tooltip: {
					trigger: 'item',
					formatter: function(params) {
					var name = params.name.replace(' (Negozio)', '').replace(' (Online)', '');
					return name + ' : ' + params.value + ' (' + params.percent + '%)';
					}
				},
				legend: {
					right: 10,
					top: 'center',
					orient: 'vertical',
					data: data.map(item => item.name)
				},
				series: [
					{
					type: 'pie',
					radius: '55%',
					center: ['50%', '50%'],
					data: data
					}
				]
			};

			myChart.setOption(option2, true);
			break;


			case "2":
				var venPerMes=alasql('SELECT MONTH(Data) AS Mese, YEAR(Data) AS Anno, ROUND(SUM(PrezzoScontrino),2) AS TotalePrezzoScontrino FROM Scontrino WHERE Data >= DATE_SUB(NOW(), INTERVAL 12 MONTH) GROUP BY YEAR(Data), MONTH(Data) ORDER BY Anno, Mese;');

				var option3={	
						tooltip: {
							trigger: 'axis',
							axisPointer: {
							type: 'shadow'
							},
							formatter: function(params) {
								var tooltipText = params[0].name + '<br/>'; 
								params.forEach(function(param) {
								  var value = param.value.toFixed(2);
								  tooltipText += param.seriesName + ': ' + value + ' \u20AC<br/>';
								});
								return tooltipText;
							  },
						},				
						title: {text: 'Vendite mensili'},
						xAxis: {data: _lastMonths},
						yAxis: {},
						legend: {left: '70%'},
						series: [{
							symbol: 'circle',
      						symbolSize: 10,
							name: 'Vendite',
							type: 'line',
							smooth: true,
							color: '#08bd02',
							data: venPerMes.map(item => item.TotalePrezzoScontrino),
							
							areaStyle: {
								color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
								  {
									offset: 0,
									color: 'rgba(8, 189, 3, 0.9)'
								  },
								  {
									offset: 1,
									color: 'rgba(8, 189, 3, 0.1)'
								  }
								])
							  },
							
								
						}]
					};
				myChart.setOption(option3, true);
				break;

			case "3":
				var queryResult = alasql("SELECT N.ID_Negozio, P.Desc_Provincia, ROUND(SUM(S.PrezzoScontrino), 2) AS ProfittiTotali FROM Negozio AS N JOIN Scontrino AS S ON N.ID_Negozio = S.Cod_Negozio JOIN Provincia AS P ON N.ID_Provincia = P.ID_Provincia GROUP BY N.ID_Negozio, P.Desc_Provincia ORDER BY ProfittiTotali DESC");
				var venPerNeg = queryResult.map(function (row) {
					return {
					  Negozio: row.ID_Negozio + ' (' + row.Desc_Provincia + ')',
					  ProfittiTotali: row.ProfittiTotali
					};
				  });

				
				var venPerEcom=alasql();
				var venOnline= alasql('SELECT ROUND(SUM(Scontrino.PrezzoScontrino), 2	) AS NumeroOrdiniOnline FROM Scontrino WHERE Flag_Online = true');

				var venTotN= venPerNeg.map(item => item.Negozio)
				venTotN.unshift("Ecom");

				var venTotV = venPerNeg.map(item => item.ProfittiTotali)
				venTotV.unshift(null);

				var option4={
						tooltip: {
							trigger: 'axis',
							axisPointer: {
							type: 'shadow'
							
							},
							formatter: function(params) {
								
								var tooltipText = params[0].name + '<br/>'; 
								params.forEach(function(param) {
									try{
								  var value = param.value.toFixed(2);
								  tooltipText += value + ' \u20AC<br/>';
									} catch(error){
										return null;
									}
								});
								return tooltipText;
								
							  },
						},
						title: {text: 'Vendite dei negozi/ecommerce'},
						xAxis: {
							data: venTotN,
							axisLabel: {
								interval: 0,
								rotate: 45 ,
								
							  }
						},
						yAxis: {
							
						},
						legend: {
							left: '70%',
							selected: {
								'TOGGLE ECOM': false,
							},
						},
						series: [
							{
								name: 'TOGGLE ECOM',
								type: 'bar',
								color: '#dceb02',
								data: [venOnline[0].NumeroOrdiniOnline],
	
							},
							{
							name: 'Vendite',
							type: 'bar',
							color: '#dceb02',
							data: venTotV,
						},
						
					]
					};
				myChart.setOption(option4, true);
				break;

			case "4":
				
				var tesseraQuery=alasql('SELECT P.Desc_Provincia AS Provincia, ROUND(SUM(S.PrezzoScontrino),2) AS VenditeTotali, COUNT(*) AS TotaleTessereFedelta FROM Scontrino AS S LEFT JOIN Negozio AS N ON S.Cod_Negozio = N.ID_Negozio LEFT JOIN Cliente AS C ON S.ID_Cliente = C.ID_Cliente LEFT JOIN Provincia AS P ON N.ID_Provincia = P.ID_Provincia OR C.ID_Provincia = P.ID_Provincia WHERE Tessera_fedelta = true GROUP BY P.Desc_Provincia ORDER BY COUNT(*) DESC');
				var option5={
						tooltip: {
							trigger: 'axis',
							axisPointer: {
							type: 'shadow'
							}
						},
						title: {text: 'Numero carte fedelta'},
						xAxis: {data: tesseraQuery.map(item => item.Provincia)},
						yAxis: {},
						legend: {left: '70%'},
						series: [{
							name: 'Numero',
							type: 'bar',
							color: '#8b02bd',
							data: tesseraQuery.map(item => item.TotaleTessereFedelta)
						}]
					};
				myChart.setOption(option5, true);
				break;
		}						
	  }