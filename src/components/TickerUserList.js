import React from "react";
import {deleteTickerUser, getTickerUsers, putTickerUser} from "../api/Ticker";
import PropTypes from "prop-types";
import {Button, Card, Icon, List, Message, Modal} from "semantic-ui-react";
import withAuth from "./withAuth";
import {getUsers} from "../api/User";

class TickerUserList extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            availableUsers: [],
            users: [],
            usersModalOpen: false,
            deleteModalOpen: false,
            deleteUser: null,
        }
    }

    componentDidMount() {
        getTickerUsers(this.props.id).then(response => {
            if (null !== response.data.users) {
                this.setState({users: response.data.users});
            }
        });
    }

    loadUsers() {
        getUsers().then(response => {
            if (null !== response.data.users) {
                let users = [];

                response.data.users.forEach(user => {
                    if (this.contains(user, this.state.users)) {
                        return;
                    }

                    if (user.is_super_admin) {
                        return;
                    }

                    users.push(user);
                });

                this.setState({availableUsers: users});
            }
        })
    }

    contains(object, list) {
        let i;
        for (i = 0; i < list.length; i++) {
            if (list[i].id === object.id) {
                return true;
            }
        }

        return false;
    }

    addUser(user) {
        putTickerUser(this.props.id, user.id).then(response => {
            if (null !== response.data.users) {
                this.setState({users: response.data.users, usersModalOpen: false});
            }
        })
    }

    deleteUser() {
        if (null !== this.state.deleteUser) {
            deleteTickerUser(this.props.id, this.state.deleteUser.id).then(response => {
                if (null !== response.data.users) {
                    this.setState({users: response.data.users});
                }
            })
        }

        this.setState({deleteModalOpen: false, deleteUser: null});
    }

    closeUsersModal() {
        this.setState({usersModalOpen: false});
    }

    openUsersModal() {
        this.setState({usersModalOpen: true});
    }

    openDeleteModal(user) {
        this.setState({deleteModalOpen: true, deleteUser: user});
    }

    closeDeleteModal() {
        this.setState({deleteModalOpen: false});
    }

    renderAddButton() {
        return (
            <Modal trigger={<Button onClick={this.openUsersModal.bind(this)}
                                    color='teal' content='Add' icon='add' size='tiny' compact/>}
                   open={this.state.usersModalOpen}
                   onOpen={this.loadUsers.bind(this)}
                   onClose={this.closeUsersModal.bind(this)}
                   size='tiny' centered={false} closeIcon>
                <Modal.Header>Add a user</Modal.Header>
                <Modal.Content>
                    <Modal.Description>
                        {this.renderAvailableUserList()}
                    </Modal.Description>
                </Modal.Content>
            </Modal>
        );
    }

    renderUserList() {
        const users = this.state.users;

        if (users.length === 0) {
            return (
                <React.Fragment>No users are allowed to use this ticker.</React.Fragment>
            )
        }

        return (
            <List divided relaxed verticalAlign='middle'>
                {users.map(user =>
                    <List.Item key={user.id}>
                        <List.Content floated='right'>
                            {this.renderDeleteButton.call(this, user)}
                        </List.Content>
                        <List.Icon name='user' size='large' verticalAlign='middle'/>
                        <List.Content>
                            {user.email}
                        </List.Content>
                    </List.Item>
                )}
            </List>
        )
    }

    renderDeleteModal() {
        return (
            <Modal size='mini' open={this.state.deleteModalOpen} onClose={this.closeDeleteModal.bind(this)}>
                <Modal.Header>Revoke Access</Modal.Header>
                <Modal.Content>
                    <p>Are you sure you want to revoke the access for this user?</p>
                </Modal.Content>
                <Modal.Actions>
                    <Button negative onClick={this.closeDeleteModal.bind(this)}>No</Button>
                    <Button positive icon='checkmark' labelPosition='right' content='Yes'
                            onClick={this.deleteUser.bind(this)}/>
                </Modal.Actions>
            </Modal>
        )
    }

    renderDeleteButton(user) {
        return (
            <Button basic color='red' icon='delete' size='tiny' content='Remove' compact
                    onClick={this.openDeleteModal.bind(this, user)}/>
        );
    }

    renderAvailableUserList() {
        const users = this.state.availableUsers;

        if (users.length === 0) {
            return (
                <Message icon>
                    <Icon name='info circle'/>
                    <Message.Content>
                        <Message.Header>No available users found</Message.Header>
                        You need to add a user, before you can add them here.
                    </Message.Content>
                </Message>
            )
        }

        return (
            <List divided relaxed verticalAlign='middle'>
                {users.map(user => {
                        return (
                            <List.Item key={user.id}>
                                <List.Content floated='right'>
                                    <Button color='teal' size='mini'
                                            onClick={this.addUser.bind(this, user)}>Add</Button>
                                </List.Content>
                                <List.Icon name='user' size='large' verticalAlign='middle'/>
                                <List.Content>
                                    {user.email}
                                </List.Content>
                            </List.Item>
                        );
                    }
                )}
            </List>
        );
    }

    render() {
        return (
            <React.Fragment>
                <Card fluid>
                    <Card.Content>
                        The users listed below can use this ticker. Only admins can add or remove users.
                    </Card.Content>
                    <Card.Content>
                        {this.renderUserList()}
                    </Card.Content>
                    <Card.Content extra>
                        {this.renderAddButton()}
                    </Card.Content>
                </Card>
                {this.renderDeleteModal()}
            </React.Fragment>
        );
    }
}

export default withAuth(TickerUserList);

TickerUserList.propTypes = {
    id: PropTypes.number,
};
