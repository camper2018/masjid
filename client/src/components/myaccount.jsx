import React, { Component } from 'react';
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';
import axios from 'axios';

import Member from './member';
import Tab from 'react-bootstrap/Tab'
import Nav from 'react-bootstrap/Nav'
import {Row, Col } from 'reactstrap';
import Form from 'react-bootstrap/Form'
import DependentEdit from './dependentedit';
import MemberEdit from './memberedit'
import CountrySelector from './helper/countryselector.jsx'
import StateSelector from './helper/stateselector.jsx'

import './css_stuff/myaccount.css'

class MyAccount extends Component {

  state = {
    modalShow: false,
    memberShow: false,
    myaccount: {Dependents: []},
    tempdependent: {},
    dependents: [],
    depArrSize: 0,
    changeDepArr: false,
    error: ""
  };

  //LOADS DATA INTO MYACCOUNT
  async componentDidMount() {
    try {
      const id = localStorage.getItem("googleId"); //TRY TO USE THIS TO GET MEMBER
      const res = await axios.get('members/614915b63d1e5066b0675a94');{/*members/id syntax for id*/}
      this.setState({myaccount: res.data, error: ""});
      console.log("RETURN FROM BACKEND", res.data)
    } catch (e) {
      this.setState({error: e.message});
      console.error(e);
    } 
  }

  //SAVES NEW DEPENDENTS
  async saveNewDependent(m) {
    if (m.Firstname && m.Firstname.length > 0 &&
        m.Lastname && m.Lastname.length > 0 &&
        m.HouseNo && m.HouseNo.length > 0 &&
        m.Street && m.Street.length > 0) {

        const res = await axios.post('/members', m);  
        const newmembers = [...this.state.dependents, res.data];

        let account = this.state.myaccount;
        account.Dependents.push(res.data);
        this.setState({dependents: newmembers}, this.handleEditSave(account, true));
    }
  }

  //GETS DEPENDENTS BY ID AND ADDS THEM TO dependents ARRAY
  // async getDependent(id) {
  //   try {
  //     const res = await axios.get('members/' + id);
  //     const newdependents = [...this.state.dependents, res.data];
  //     this.setState({dependents: newdependents});
  //   } catch (e) {
  //     this.setState({error: e.message});
  //     console.error(e);
  //   } 
  // }

  //SAVED UPDATED MEMBERS/DEPENDENTS
  async saveUpdatedMember(m) {
    try {
      if(m.Dependents.length > 0 && typeof m.Dependents[0] !== "string"){
        let dependents = [];
        await m.Dependents.forEach(dep => dependents.push(dep._id));
        m.Dependents = dependents;
      }
      await axios.put('members/' + m._id, m);
      const member = await axios.get('members/' + m._id)
      this.setState({myaccount: member.data})
      // TODO: update with the member details returned from server? 
    } catch (error) {
      console.error(error);
    }
  }

  //HANDLES SAVING EDITED MEMBERS/DEPENDENTS AND SAVING NEW DEPENDENTS
  handleEditSave = (m, isOwner) => {
    try {
      let member;
      if (isOwner) {
        member = this.state.myaccount; //SET MEMBER TO MYACCOUNT
        // console.log("IN OWNER", member)
      } else {
        member = this.state.dependents.find(el => el._id === m._id); //SET MEMBER TO DEPENDENT
      }
      if(member) { //UPDATE MEMBER/DEPENDENT
        member.Firstname = m.Firstname;
        member.Lastname = m.Lastname;
        member.HouseNo = m.HouseNo;
        member.Street = m.Street;
        member.Village = m.Village;
        member.City =  m.City; 
        member.Postcode = m.Postcode; 
        member.Country =  m.Country;
        member.Gender = m.Gender;
        member.Spouse = m.Spouse;
        member.State = m.State;
        member.Voter = m.Voter;
        member.PhoneNum = m.PhoneNum;
        member.Email = m.Email;
        member.DateOfBirth = m.DateOfBirth;
        member.Relationship = m.Relationship;
        member.Guardians = m.Guardians;
        member.Dependents = m.Dependents;
        this.saveUpdatedMember(member);
        if(isOwner){
          console.log("Update member - ", member);
          this.setState({myaccount: member});
        } else{
          console.log("Update dependent - ", member);
          let newDep = [...this.state.dependents];
          newDep.splice(this.state.dependents.findIndex(el => el._id === member._id), 1);
          newDep.push(member);
          this.setState({dependents: newDep},
            this.fillDependentArray());
        }
      } else{ //ADD NEW DEPENDENT
        console.log("Save dependent - ", m);
        m.Guardians.push(this.state.myaccount._id);
        this.saveNewDependent(m);
      }
    }
    catch (error) {
      console.error(error);
    }
  }
  
  //REMOVES COPIES FROM dependents ARRAY BUT NEEDS WORK
  // removeCopies(){
  //   let newArr = [], retest = [], doOver = [];
  //   let i = 0;
  //   while(i < this.state.depArrSize){
  //     if(newArr.length === 0){newArr.push(this.state.dependents[i])}
  //     else if(!newArr.find(dep => dep === this.state.dependents[i])){newArr.push(this.state.dependents[i])}
  //     i++;
  //   }
  //   newArr.forEach(dep => retest.push(dep.Firstname));
  //   doOver = retest.filter((c, index) => {
  //       return retest.indexOf(c) !== index;
  //   });
  //   if(doOver.length > 0){
  //     console.log(doOver);
  //     this.fillDependentArray();
  //     // this.setState({dependents: newArr});
  //   } else{
  //     this.setState({dependents: newArr});
  //   }
  // }
  
  //RESETS dependents ARRAY AND THEN CALLS getDependent FOR EACH DEPENDENT ID IN MYACCOUNT.DEPENDENTS
  // fillDependentArray() {
  //   this.setState({dependents: []},
  //     this.state.myaccount.Dependents.forEach(dep => this.getDependent(dep))
  //   );
  // }

  //SETS DEPENDENTEDIT MODAL
  setModalShow = (e) => { //true or false
    this.setState({modalShow: e});
  }

  //SHOWS DEPENDENT EDIT MODAL
  showDependentEditDialog = (member) => {
    this.setState({ 
      tempdependent: member},
    this.setModalShow(true));
  }
  
  //HIDES DEPENDENT EDIT MODAL
  hideDependentEditDialog = () => {
    this.setModalShow(false);
  }

  setMemberShow = (e) => { //true or false
    this.setState({memberShow: e});
  }

  showMemberEditDialog = () => {
    this.setMemberShow(true);
  }

  hideMemberEditDialog = () => {
    this.setMemberShow(false);
  }

  //PREPARES FOR NEW DEPENDENT AND OPENS DEPENDENT MODAL
  addNewDependent = () => {
    let m = {...this.state.myaccount};
      this.setState({
        tempdependent: {
          Firstname: "", Lastname: "", 
          HouseNo: m.HouseNo, Street: m.Street,  Village: m.Village,
          City: m.City, State: m.State, Country: m.Country,
          Postcode: m.Postcode, Guardians: []
          }
      }, this.setModalShow(true));
  }

  //CANCELS MEMBER EDIT
  editMemberOnCancel = () => {
    // this.editMember();
    this.hideMemberEditDialog();
  }

  //SAVES EDITED MEMBER
  editMemberOnSave = (m) => {
    // this.editMember();
    this.hideMemberEditDialog();
    console.log("Update member - ", m);
    this.saveUpdatedMember(m, true);
  }

  editMember = () => {
    this.showMemberEditDialog();
    //FOR HIDING AND SHOWING SAVE AND CANCEL
    // var x = document.getElementById("editing");
    // if(x.style.display === 'none'){
    //   x.style.display = 'block';
    //   document.getElementById('editMemButton').style.display = 'none';
    // } else {
    //   x.style.display = 'none';
    //   document.getElementById('editMemButton').style.display = 'block';
    // }

    // //FOR DISABLING AND ENABLING FORM
    // var y = document.getElementById("target").elements;
    // for(var i = 0; i < y.length; i++){
    //   if(y[i].disabled){
    //     y[i].disabled = false;
    //   } else{
    //     y[i].disabled = true;
    //   }
    // }
  }

  //CALULATES AGE OF DEPENDENT
  calulateAge(dob){
    let age, month, day, year;
    // dob = "09/16/2000";
    let date = new Date();
    if(dob){
      month = dob.slice(0,2); day = dob.slice(3, 5); year = dob.slice(6,11);
      age = date.getFullYear() - year;
      if(date.getMonth()+1 - month < 1){
        if(date.getMonth()+1 - month === 0){
          if(date.getDate() - day < 0){
            age--;
          }
        } else{
          age--;
        }
      }
    } else {
      age = "Need DOB";
    }
    return age;
  }

  render () {
    let detailPage, dependentPage;
    // console.log("LOCAL", localStorage.getItem("user_displayName"), localStorage.getItem("user_email"),localStorage.getItem("test") );
    const thisaccount = this.state.myaccount;
    var editaccount = {...thisaccount};
    const dependent = this.state.myaccount.Dependents;

    // console.log("LOCALstorage", localStorage);
    // localStorage.id = null;
    // if(!localStorage.id || localStorage.id === null){
    //   console.log("in if")
    //   localStorage.id = this.state.myaccount._id;
    // }
    // else{
    //   console.log("in else", localStorage.id, this.state.myaccount._id)
    // }

    console.log("MYACCOUNT", thisaccount);
    
    if(editaccount.Firstname && editaccount.Firstname === this.state.myaccount.Firstname){
      detailPage  = 
      <React.Fragment>
        
        {/* Personal Information Below */}
        <h4 className="ml-3">
          Personal Information 
          <Button id="editMemButton" variant="dark" onClick={/*this.showEditMember*/ this.editMember}>Edit Member</Button>
          </h4>
        <hr class="solid mr-2" />

        <Form id="target">
        <Row className="ml-4 mt-4">
          <Col>
            <Form.Group className="mb-4" >
              <Form.Label>First Name</Form.Label>
              <Form.Control 
                defaultValue={editaccount.Firstname} 
                onChange={(e) => {
                  editaccount.Firstname = e.target.value.toLocaleUpperCase();
                }} 
                className="detailSelWid" 
                disabled/>  
            </Form.Group>
            <Form.Group className="mb-4">
              <Form.Label>Date of Birth</Form.Label>
              <Form.Control 
                defaultValue={editaccount.DateOfBirth} 
                onChange={(e) => {
                  editaccount.DateOfBirth = e.target.value.toLocaleUpperCase();
                }} 
                className="detailSelWid" 
                disabled/>  
            </Form.Group>
            
          </Col>
          <Col>
              <Form.Group className="mb-4">
                <Form.Label>Last Name</Form.Label>
                <Form.Control 
                  defaultValue={editaccount.Lastname} 
                  onChange={(e) => {
                    editaccount.Lastname = e.target.value.toLocaleUpperCase();
                  }} 
                  className="detailSelWid" 
                  disabled/>  
              </Form.Group>
              <Form.Group className="mb-4">
                <Form.Label>Gender</Form.Label>
                <Form.Control            
                  defaultValue={editaccount.Gender} 
                  onChange={(e) => {
                    editaccount.Gender = e.target.value.toLocaleUpperCase();
                  }}             
                  className="detailSelWid" 
                  as="select"
                  disabled>
                    <option>n/a</option>
                    <option value="FEMALE">Female</option>
                    <option value="MALE">Male</option>
                </Form.Control>  
              </Form.Group>
          </Col>
          <Col>
            <Form.Group className="mb-4">
              <Form.Label>Spouse</Form.Label>
              <Form.Control  
                defaultValue={editaccount.Spouse}
                className="detailSelWid"
                onChange={(e) => {
                  editaccount.Spouse = e.target.value.toLocaleUpperCase();
                }}  
                as="select"
                disabled>
                  <option value="No">No</option>
                  <option value="Yes">Yes</option>
              </Form.Control>   
            </Form.Group>
          </Col>
        </Row>

        {/* Address Information Below */}
        <h4 className="ml-3">Address Information</h4>
        <hr class="solid mr-2" />
        <Row className="ml-4 mt-4">
          <Col>
            <Form.Group className="mb-4">
              <Form.Label>House Number</Form.Label>
              <Form.Control
                defaultValue={this.state.myaccount.HouseNo}
                onChange={(e) => {
                  editaccount.HouseNo = e.target.value.toLocaleUpperCase();
                }}
                className="detailSelWid" 
                disabled/>  
            </Form.Group>
            <Form.Group className="mb-4">
                <Form.Label>City</Form.Label>
                <Form.Control 
                  defaultValue={editaccount.City} 
                  onChange={(e) => {
                    editaccount.City = e.target.value.toLocaleUpperCase();
                  }} 
                  className="detailSelWid" 
                  disabled/>   
            </Form.Group>
          </Col>
          <Col>
            <Form.Group className="mb-4">
              <Form.Label>Street</Form.Label>
              <Form.Control
                defaultValue={this.state.myaccount.Street}
                onChange={(e) => {
                  editaccount.Street = e.target.value.toLocaleUpperCase();
                }}
                className="detailSelWid" 
                disabled/>  
            </Form.Group>
            <Form.Group className="mb-4">
              <Form.Label>State</Form.Label>
              <Form.Control 
                defaultValue={editaccount.State} 
                onChange={(e) => {
                  editaccount.State = e.target.value.toLocaleUpperCase();
                }} 
                className="detailSelWid" 
                as="select"
                disabled>
                  <StateSelector /> 
                </Form.Control> 
            </Form.Group>
          </Col>
          <Col>
            <Form.Group className="mb-4">
              <Form.Label>Village</Form.Label>
              <Form.Control 
                defaultValue={editaccount.Village} 
                onChange={(e) => {
                  editaccount.Village = e.target.value.toLocaleUpperCase();
                }} 
                className="detailSelWid" 
                disabled/>    
            </Form.Group>
            <Form.Group className="mb-4">
                <Form.Label>Country</Form.Label>
                <Form.Control 
                  defaultValue={editaccount.Country} 
                  onChange={(e) => {
                    editaccount.Country = e.target.value.toLocaleUpperCase();
                  }} 
                  className="detailSelWid" 
                  as="select"
                  disabled> 
                    <CountrySelector />
                  </Form.Control>
              </Form.Group>
          </Col>
        </Row>

        {/* Contact Info Below */}
        <h4 className="ml-3">Contact Information</h4>
        <hr class="solid mr-2" />
        <Row className="rowSpace">
           <Form.Group className="detailSpace mb-4">
                <Form.Label>Email</Form.Label>
                <Form.Control 
                  defaultValue={editaccount.Email} 
                  onChange={(e) => {
                    editaccount.Email = e.target.value.toLocaleUpperCase();
                  }} 
                  className="detailSelWid" 
                  disabled/>    
               </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label>Phone Number</Form.Label>
                <Form.Control 
                  defaultValue={editaccount.PhoneNum} 
                  onChange={(e) => {
                    editaccount.PhoneNum = e.target.value.toLocaleUpperCase();
                  }} 
                  className="detailSelWid" 
                  disabled/>    
               </Form.Group> 
        </Row>      
        </Form>

         {/* Member Info Below UNCOMMENT ONCE THE MEMBER TYPE AND STATUS ARE IMPLEMENTED*/}

        {/*<h4 className="ml-3">Member Information</h4>
        <hr class="solid mr-2" />
        <Row className="rowSpace">
           <Form.Group className="detailSpace mb-4">
                <Form.Label>Member Type</Form.Label>
                <Form.Control value="Paying" className="detailSelWid"/>    
               </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label>Member Status</Form.Label>
                <Form.Control value="Active" className="detailSelWid"/>    
               </Form.Group> 
        </Row>*/}

        <div id="editing" style={{display: 'none'}}>
          <hr class="dsolid mr-2" />
          <Button variant="dark" onClick={() => {this.editMemberOnSave(editaccount)}} style={{float:'left'}}>Save</Button>
          <Button variant="dark" onClick={() => {editaccount = {...thisaccount}; this.editMemberOnCancel()}}style={{float:'left'}}>Cancel</Button>
        </div>
      </React.Fragment>;
    }

    if(thisaccount.Dependents.length > 0){
      // if(this.state.depArrSize !== thisaccount.Dependents.length){
      //   this.setState({depArrSize: thisaccount.Dependents.length}, this.fillDependentArray());
      // }
      // if(this.state.dependents.length > this.state.depArrSize){
      //   this.removeCopies();
      // }


      dependentPage =
        <React.Fragment>
          <h4 className="ml-3">
          Dependents 
          <Button variant="success" className="mb-3" onClick={this.addNewDependent}>Add Dependent</Button>
          </h4>
          <hr class="solid mr-2" />
          <Table className="mr-4 table">
            <thead>
              <tr>
                <th className="depTableHead">First Name</th>
                <th className="depTableHead">Last Name</th>
                <th className="depTableHead">Relationship</th>
                <th className="depTableHead">Age</th>
                <th className="depTableHead">View/Edit Info</th>
              </tr>
            </thead>
            <tbody>
            {dependent.map((dep) => {
                return (
                  <tr>
                    <td className="tablebody">{dep.Firstname}</td>
                    <td className="tablebody">{dep.Lastname}</td>
                    <td className="tablebody">{(dep.Relationship) ? dep.Relationship : "Relationship"}</td>
                    <td className="tablebody">{this.calulateAge(dep.DateOfBirth)}</td>
                    <Member 
                      isNewDep={false} 
                      isDep={true}
                      handleMemberEdit={this.showDependentEditDialog}
                      member={dep}
                      className="tablebody"
                    />
                  </tr>
                ); 
            })}
            </tbody>
          </Table>
        </React.Fragment>
    } else{ 
        dependentPage =  
        <React.Fragment>
          <h4 className="ml-3">
            Dependents 
            <Button variant="warning" className="mb-3" onClick={this.addNewDependent}>Add Dependent</Button>
          </h4>
          <hr class="solid mr-2" />
          <h2>NO DEPENDENTS</h2>
        </React.Fragment>}


    return (
      <React.Fragment>
        <DependentEdit
          member={this.state.tempdependent}
          show={this.state.modalShow}
          onCancel={this.hideDependentEditDialog}
          onSave={this.handleEditSave}
          addDependent={this.addDependent}
          myAccount={true}
        />

        <MemberEdit
          member={this.state.myaccount}
          show={this.state.memberShow}
          onDependentShow={this.hideMemberEditDialog}
          onDependentHide={this.showMemberEditDialog}
          onCancel={this.editMemberOnCancel}
          onSave={this.editMemberOnSave}
          myAccount={true}
        />
        
        <div>
          <h1 class="header"> 
            My Account
          </h1>
        </div>
        <div>
          <Tab.Container id="left-tabs-example" defaultActiveKey="details" className="w-50">
          <Row>
            <Col sm={3}>
              <Nav variant="pills" className="flex-column">
                <Nav.Item>
                  <Nav.Link eventKey="details">My Details</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="dependents">My Dependents</Nav.Link>
                </Nav.Item>
              </Nav>
            </Col>
            <Col sm={9}>
              <Tab.Content className="outline">
                <Tab.Pane eventKey="details">
                  {detailPage}
                </Tab.Pane>
                <Tab.Pane eventKey="dependents">
                  {dependentPage}
                </Tab.Pane>
              </Tab.Content>
            </Col>
          </Row>
        </Tab.Container>
      </div>
    </React.Fragment>
    );
  }
    
}

  
export default MyAccount;