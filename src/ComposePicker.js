import React, { Component } from 'react';
import { View, TouchableHighlight, Modal, Text, Alert } from 'react-native';
import { string, func } from 'prop-types';
import DateRange from './DateRange';
import moment from 'moment';
import normalize from './normalizeText';

const styles = {
	placeholderText: {
		color: '#c9c9c9',
		fontSize: normalize(18),
	},
	contentInput: {
		alignItems: 'center',
		justifyContent: 'center',
	},
	contentText: {
		fontSize: normalize(18),
	},
	stylish: {
		height: 48,
		borderColor: '#bdbdbd',
		borderWidth: 2,
		borderRadius: 32,
	},
};

const defaultReturnFormat = 'YYYY/MM/DD';
const defaultOutFormat = 'LL';
export default class ComposePicker extends Component {
	constructor(props) {
		super(props);
		this.state = {
			modalVisible: false,
			allowPointerEvents: true,
			showContent: false,
			selected: '',
			startDate: null,
			endDate: null,
			date: new Date(),
			focus: 'startDate',
			currentDate: moment(),
		};
	}
	isDateBlocked = date => {
		const { blockBefore, blockAfter } = this.props;
		if (blockBefore) {
			return date.isBefore(moment(), 'day');
		} else if (blockAfter) {
			return date.isAfter(moment(), 'day');
		}
		return false;
	};
	onDatesChange = event => {
		const { startDate, endDate, focusedInput, currentDate } = event;
		if (currentDate) {
			this.setState({ currentDate });
			return;
		}
		this.setState({ ...this.state, focus: focusedInput }, () => {
			this.setState({ ...this.state, startDate, endDate });
		});
	};
	setModalVisible = visible => {
		this.setState({ modalVisible: visible });
	};
	onConfirm = () => {
		const {
			returnFormat,
			outFormat,
			mode,
			onConfirm,
			dateSplitter,
			onError,
		} = this.props;
		const { currentDate, startDate, endDate } = this.state;
		if (!mode || mode === 'single') {
			this.setState({
				showContent: true,
				selected: currentDate.format(outFormat || defaultOutFormat),
			});
			this.setModalVisible(false);
			if (typeof onConfirm === 'function') {
				onConfirm({
					currentDate: currentDate.format(returnFormat || defaultReturnFormat),
				});
			}
			return;
		}

		if (startDate && endDate) {
			const start = startDate.format(outFormat || defaultOutFormat);
			const end = endDate.format(outFormat || defaultOutFormat);
			this.setState({
				showContent: true,
				selected: `${start} ${dateSplitter} ${end}`,
			});
			this.setModalVisible(false);
			this.callOnConfirmProp();
		} else {
			onError();
		}
	};

	callOnConfirmProp = () => {
		const { onConfirm, returnFormat } = this.props;
		const { startDate, endDate } = this.state;
		if (typeof onConfirm === 'function') {
			onConfirm({
				startDate: startDate.format(returnFormat || defaultReturnFormat),
				endDate: endDate.format(returnFormat || defaultReturnFormat),
			});
		}
	};
	getTitleElement() {
		const { placeholder, customStyles = {}, allowFontScaling } = this.props;
		const { selected, showContent } = this.state;
		if (!showContent && placeholder) {
			return (
				<Text
					allowFontScaling={allowFontScaling}
					style={[styles.placeholderText, customStyles.placeholderText]}
				>
					{placeholder}
				</Text>
			);
		}
		return (
			<Text
				allowFontScaling={allowFontScaling}
				style={[styles.contentText, customStyles.contentText]}
			>
				{selected}
			</Text>
		);
	}

	renderButton = () => {
		const {
			customButton,
			ButtonStyle,
			ButtonTextStyle,
			ButtonText,
		} = this.props;

		if (customButton) {
			return customButton(this.onConfirm);
		}
		return (
			<TouchableHighlight
				underlayColor={'transparent'}
				onPress={this.onConfirm}
				style={[{ width: '80%', marginHorizontal: '3%' }, ButtonStyle]}
			>
				<Text style={[{ fontSize: 20 }, ButtonTextStyle]}>
					{ButtonText ? ButtonText : 'Send'}
				</Text>
			</TouchableHighlight>
		);
	};

	render() {
		const { customStyles = {}, centerAlign } = this.props;

		let style = styles.stylish;
		style = centerAlign ? { ...style } : style;
		style = { ...style, ...this.props.style };

		return (
			<TouchableHighlight
				underlayColor={'transparent'}
				onPress={() => {
					this.setModalVisible(true);
				}}
				style={[
					{ width: '100%', height: '100%', justifyContent: 'center' },
					style,
				]}
			>
				<View>
					<View>
						<View style={[customStyles.contentInput, styles.contentInput]}>
							{this.getTitleElement()}
						</View>
					</View>
					<Modal
						animationType="slide"
						onRequestClose={() => this.setModalVisible(false)}
						transparent={false}
						visible={this.state.modalVisible}
					>
						<View stlye={{ flex: 1, flexDirection: 'column' }}>
							<View style={{ height: '90%' }}>
								<DateRange
									headFormat={this.props.headFormat}
									customStyles={this.props.customStyles}
									markText={this.props.markText}
									onDatesChange={this.onDatesChange}
									isDateBlocked={this.isDateBlocked}
									startDate={this.state.startDate}
									endDate={this.state.endDate}
									focusedInput={this.state.focus}
									selectedBgColor={this.props.selectedBgColor || undefined}
									selectedTextColor={this.props.selectedTextColor || undefined}
									mode={this.props.mode || 'single'}
									currentDate={this.state.currentDate}
								/>
							</View>
							<View
								style={{
									paddingBottom: '5%',
									width: '100%',
									height: '10%',
									flexDirection: 'row',
									justifyContent: 'center',
									alignItems: 'center',
								}}
							>
								{this.renderButton()}
							</View>
						</View>
					</Modal>
				</View>
			</TouchableHighlight>
		);
	}
}

ComposePicker.propTypes = {
	dateSplitter: string,
	onError: func,
};

ComposePicker.defaultProps = {
	dateSplitter: '->',
	onError: () => Alert.alert('Error', 'Please select a valid date'),
	returnFormat: defaultReturnFormat,
	outFormat: defaultOutFormat,
};
