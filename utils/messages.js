import moment from 'moment';


export default function formatMessage(username, text) {
    return {
        text,
        username,
        time: moment().format('h:mm a'),
    }
}