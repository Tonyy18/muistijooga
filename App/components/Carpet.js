import { StyleSheet, Text, View, Alert, Image} from 'react-native';
import CheckBox from '@react-native-community/checkbox';
import React, { Component, useEffect, useState } from 'react';
import {Picker} from '@react-native-picker/picker';
import Patterns from "./Patterns"
const ROW_NUMBER = 6;
const MAX_STEP = 20; //The maximum step number
console.disableYellowBox = true;
class Cell extends Component {
    constructor(props) {
        super(props);
    }
    render() {
        let _style = [style.cell];
        if(this.props.inrow == 3) {
            _style.push(style.cellStronger);
        } else if(this.props.inrow != 1 ){
            _style.push(style.cellLeft);
        }
        //Convert numbers to alphabets
        let letter = String.fromCharCode(this.props.number + 64);
        if(letter == "W") {
            letter = "X";
        } else if(this.letter == "X") {
            letter = "Y";
        }
        let pattern = this.props.state.pattern //Pattern in use
        let leftSteps = pattern.getLeftSteps(this.props.state.direction);
        leftSteps = leftSteps.filter((el) => {
            return el <= MAX_STEP;
        })
        let rightSteps = pattern.getRightSteps(this.props.state.direction);
        rightSteps = rightSteps.filter((el) => {
            return el <= MAX_STEP;
        })
        //The game
        //The whole idea is just to show correct image in a step
        //If the step number is in the correctSteps array show green foot otherwise show red
        //If in the leftSteps array show left step image etc...
        let wrong = false;
        let correct = false;

        if(this.props.state.correctSteps.indexOf(this.props.number) > -1) {
            correct = true;
        }
        if(this.props.data.indexOf(this.props.number) > -1 && this.props.state.correctSteps.indexOf(this.props.number) == -1) {
            wrong = true;
        }

        let image;
        const lowerSteps = pattern.getLowerSteps();
        if(leftSteps.indexOf(this.props.number) > -1) {
            if(correct) {
                image = <Image style={style.stepImage} source={require('../assets/step-left-correct.png')} />;
            } else if(wrong) {
                image = <Image style={style.stepImage} source={require('../assets/step-left-wrong.png')} />;
            } else if(this.props.state.showPattern){
                image = <Image style={style.stepImage} source={require('../assets/step-left.png')} />;
            }
        } else if(rightSteps.indexOf(this.props.number) > -1) {
            if(correct) {
                image = <Image style={style.stepImage} source={require('../assets/step-right-correct.png')} />;
            } else if(wrong) {
                image = <Image style={style.stepImage} source={require('../assets/step-right-wrong.png')} />;
            } else if(this.props.state.showPattern){
                image = <Image style={style.stepImage} source={require('../assets/step-right.png')} />;
            }
        }
        let imageStyle = style.imageParent;
        if(lowerSteps.indexOf(this.props.number) > -1) {
            imageStyle = style.imageParentLow;
        }
        return (
            <View style={_style}>
                <View style={style.cellText}>
                    <Text style={style.cellNumber}>{this.props.number}</Text>
                    <Text style={style.cellLetter}>{letter}</Text>
                </View>
                <View style={imageStyle}>{image}</View>
            </View>
        )
    }
}

class Row extends Component {
    //Generate rows
    constructor(props) {
        super(props);
    }

    render() {
        let _style = [style.row];
        if(this.props.number != 5) {
            _style.push(style.rowBorder);
        }
        let start = (ROW_NUMBER * 4 + 1) - (4 * this.props.number);
        let cells = []
        for(let a = 4; a >= 1; a--) {
            cells.push(<Cell inrow={a} number={start - a} key={a} data={this.props.data} state={this.props.state}/>)
        }
        return (
            <View style={_style} key={this.props.number}>
                {cells}
            </View>
        )
    }
}

export default class Carpet extends Component {

    constructor(props) {
        super(props);
        this.state = {
            pattern: Patterns.objects[0],
            nextStep: 0, //Index
            correctSteps: [],
            finished: false,
            showPattern: false,
            direction: false,
            stepCount: 0
        }
        //Pattern: Current step pattern in use
        //NextStep: Index for the next step in current step array (upward or backward step array from step pattern getSteps method)
        //correctSteps: correctSteps within the current step array (up or down step array). Resets when direction changes. (Basicly only shows the correct step images (green steps))
        //Finished: Activated on last step. Shows modal
        //showPattern: For checkbox. Shows step images when true
        //direction: Up or down. Used when requesting steps from pattern. false = steps up, true = steps down
        //stepCount: The actual amount of correct steps. Doesn't reset like the correctSteps array. Used to validate the end of steps
        //(Stepcount == pattern.getSteps(null).length) == all steps ready
        this.pickerItems = [];
        for(let a = 0; a < Patterns.objects.length; a++) {
            const pattern = Patterns.objects[a].patternName;
            this.pickerItems.push(<Picker.Item key={pattern} label={pattern} value={Patterns.objects[a]}/>)
        }
    }
    reset() {
        this.setState({
            correctSteps: [],
            finished: false,
            nextStep: 0,
            direction: false,
            stepCount: 0
        })
    }
    render() {
        //Convert string data ':1:2:3:'
        //to array [1,2,3]
        let data = this.props.data.split(":")
        data.pop();
        data.shift();
        data = data.map(x => parseInt(x))

        if(this.state.finished == false) {
            let _steps = this.state.pattern.getSteps(this.state.direction); //Steps in current direction (up or down)
            let _allSteps = this.state.pattern.getSteps(null); //All steps (up and down steps combined). 
            //Maximum of 20 steps. Remove others
            //Last 4 steps are not used so those are removed here
            let steps = _steps.filter((el) => {
                return el <= MAX_STEP;
            })
            let allSteps = _allSteps.filter((el) => {
                return el <= MAX_STEP;
            })
            let correctSteps = this.state.correctSteps;

            if(correctSteps.length == steps.length && this.state.direction == false) {
                //Changes direction
                this.setState({
                    correctSteps: [],
                    direction: true,
                    nextStep: 0
                })
            }
            let nextStep = steps[this.state.nextStep]; //Number of next step in pattern
            if(data.indexOf(nextStep) > -1) {
                //If the step is in the data array
                correctSteps.push(nextStep)
                this.setState({
                    correctSteps: correctSteps,
                    nextStep: this.state.nextStep + 1,
                    stepCount: this.state.stepCount + 1
                })
            }
            if(this.state.stepCount == allSteps.length && this.state.finished == false) {
                //All correct steps done
                this.setState({
                    finished: true
                })
            }
        }

        let rows = [];
        for(let a = 0; a < ROW_NUMBER; a++) {
            rows.push(<Row side="left" key={"row-" + a} number={a} data={data} state={this.state}/>)
        }
        return (
            <View style={style.carpet}>
                {this.state.finished == true &&
                    <View style={style.modal}>
                        <Text style={style.modalText}>Valmis</Text>
                        <Text onPress={() => {this.reset()}} style={style.modalButton}>Aloita alusta</Text>
                    </View>
                }
                <View style={style.header}>
                    <Picker style={style.picker}
                    selectedValue={this.state.pattern} 
                    onValueChange={(item, index) => {this.setState({pattern:item}); this.reset()}}>
                        {this.pickerItems}
                    </Picker>
                    <View style={style.checkboxParent}>
                        <Text>Näytä kuvio</Text>
                        <CheckBox
                            style={style.checkbox}
                            disabled={false}
                            value={this.state.showPattern}
                            onValueChange={() => {
                                if(this.state.showPattern) {
                                    this.setState({
                                        showPattern: false
                                    })
                                } else {
                                    this.setState({
                                        showPattern: true
                                    })
                                }
                            }}
                        />
                    </View>
                </View>
                {rows}
                {this.state.direction == false &&  
                    <Text style={style.direction}>
                        Ylöspäin
                    </Text> 
                }
                {this.state.direction == true &&  
                    <Text style={style.direction}>
                        Alaspäin
                    </Text> 
                }
            </View>
        )
    }
}

const style = StyleSheet.create({
    direction: {
        fontSize: 16,
        textAlign: "center",
        padding: 20,
        borderTopColor: "#E2E2E2",
        borderStyle: "solid",
        borderTopWidth: 1
    }, 
    modalText: {
        fontSize: 16
    },
    modalButton: {
        color: "#ffffff",
        backgroundColor: "#00AEFF",
        padding: 10,
        marginTop: 30,
        borderRadius: 5
    },  
    modal: {
        position: "absolute",
        width: "100%",
        height: 200,
        top: 150,
        borderRadius: 10,
        backgroundColor: "#ffffff",
        zIndex: 1000,
        justifyContent: "center",
        alignItems: "center",
        shadowColor: '#171717',
        shadowOffset: {width: -2, height: 4},
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 20,
        shadowColor: '#52006A',
    },  
    picker: {
        marginBottom: 20,
        flexGrow: 1,
        marginRight: 10
    },
    header: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        paddingRight: 15,
        paddingLeft: 15
    },
    checkbox: {
        marginLeft: "auto",
        marginRight: "auto"
    },  
    stepNumber: {
        position: "absolute",
        textAlign: "center",
        color: "#ffffff",
        width: "100%",
    },
    imageParent: {
        height: "50%",
        width: "50%",
        flex: 1,
        justifyContent: "center",
        marginLeft: "auto",
        marginRight: "auto"
    },
    imageParentLow: {
        marginTop: 40,
        height: "50%",
        width: "50%",
        flex: 1,
        justifyContent: "center",
        marginLeft: "auto",
        marginRight: "auto"
    },
    stepImage: {
        flex: 1,
        width: null,
        height: null,
        resizeMode: "contain"
    },
    carpet: {
        flex: 1,
        flexDirection: "column"
    },
    row: {
        flex: 1,
        flexDirection: "row"
    },
    rowBorder: {
        borderBottomColor: "#E2E2E2",
        borderStyle: "solid",
        borderBottomWidth: 1
    },
    cell: {
        width: "25%",
        padding: 10,
    },
    cellStronger: {
        borderRightColor: "#B3B3B3",
        borderRightWidth: 2,
        borderStyle: "solid",
    },
    cellLeft: {
        borderRightColor: "#E2E2E2",
        borderStyle: "solid",
        borderRightWidth: 1
    },
    cellText: {
        flex: 1,
        flexDirection: "row",
        position: "absolute",
        top: 10,
        right: 10,
    },
    cellNumber: {
        marginRight: 5
    }
})