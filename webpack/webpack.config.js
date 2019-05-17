const path = require('path');
const HtmlWebPackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
	entry   : path.resolve(__dirname, '../src/pixel_sphere.js'),
	output  : {
		path     : path.resolve(__dirname, '..', 'dist'),
		filename : 'build.js'
	},
	plugins : [
		new MiniCssExtractPlugin(),
		new HtmlWebPackPlugin({
			title    : 'Cube sphere',
			template : path.resolve(__dirname, 'index.ejs'),
			inject   : 'head'
		})
	],
	module  : {
		rules : [
			{
				test : /\.less$/,
				use  : [
					MiniCssExtractPlugin.loader,
					'css-loader',
					{
						loader  : 'less-loader',
						options : {
							paths : [ path.resolve(__dirname, '../node_modules') ]
						}
					}
				]
			}
		]
	},
	mode    : 'production'
};
