document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  

  // Event listener for the compose form.
  document.querySelector('#compose-form').addEventListener('submit', sendEmail);

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#read-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function readEmail(email){
  let newID= parseInt(email.id, 10);
  const readView = document.querySelector('#read-view');
  
  // fetch read email with put and set the read value to true
  fetch(`/emails/${newID}`,{
    method: 'PUT',
    body : JSON.stringify({
      read: true
    })
    
  })
   
  // fetch a particular email to read by its ID
  fetch(`/emails/${newID}`)
  .then(response => response.json())
  .then(email => {
    
    // Show the mailbox and hide other views
    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'none';
    document.querySelector('#read-view').style.display = 'block';

    const readDiv = document.createElement('div');
    const sender = document.createElement('div');
    const recipients = document.createElement('div');
    const subject = document.createElement('div')
    const emailBody = document.createElement('div');
    const dateTime = document.createElement('p')
    
   
    sender.innerHTML = `<strong>From:</strong> ${email.sender}`;
    recipients.innerHTML = `<strong>To:</strong> ${email.recipients}`
    subject.innerHTML = `<strong>Subject:</strong> ${email.subject}`;
    dateTime.innerHTML = `<strong>Timestamp:</strong> ${email.timestamp}`;
    emailBody.innerHTML = `${email.body}`;

    readDiv.appendChild(sender);
    readDiv.appendChild(recipients);
    readDiv.appendChild(subject);
    readDiv.appendChild(dateTime);

    const replyButton = document.createElement('button');
    replyButton.innerHTML = "Reply"
    replyButton.classList.add('reply-button')
    replyButton.className='btn btn-sm btn-outline-primary'
    replyButton.addEventListener('click', () => {
      replyEmail(email)
    })

    readDiv.appendChild(replyButton)
    readDiv.appendChild(emailBody);

    readDiv.classList.add('read-div');

    
    readView.appendChild(readDiv)



  })
}

function replyEmail(email){
  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#read-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  const sender = email.sender;

  let subject = email.subject
  if(subject.slice(0,3) != "Re:"){
    subject = `Re: ${subject}`
  }
  
  const timestamp = email.timestamp;
  const body = email.body;

  document.querySelector('#compose-recipients').value = sender;
  document.querySelector('#compose-subject').value = subject;
  document.querySelector('#compose-body').value = `On ${timestamp} ${sender} wrote:\n${body}`;
}

function archive_email(email, mailbox){
   const ID = email.id
   // calling the fetch API to toggle the archived data of the email
   fetch(`/emails/${ID}`,{
      method: 'PUT',
      body : JSON.stringify({
      archived: !email.archived
      })
    })
    .then(email => {
      //called the load_mailbox("inbox") with the inbox parameter so the inbox can be reloaded.
      load_mailbox("inbox");
    })

}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#read-view').style.display = 'none';

  // Show the mailbox name
 // const emailView = document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
  const emailView = document.querySelector('#emails-view');
  emailView.innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
  

  //get emails from the server with fetch API
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
      emails.forEach(email => {
      const mainDiv = document.createElement('div');
      mainDiv.classList.add('main-div');
      const parentDiv = document.createElement('div');
      const sender = document.createElement('div');
      const subject = document.createElement('div')
      subject.style.marginLeft = '40px';
      subject.style.width = '300px';
      const emailBody = document.createElement('div');
      const dateTime = document.createElement('div');
      dateTime.style.marginLeft = '40px';
    
      const archivedButton = document.createElement('button');
      archivedButton.className = 'btn-info';
      
      sender.innerHTML = `<strong>${email['sender']}</strong>`;
      subject.innerHTML = `${email['subject']}`;
      //emailBody.innerHTML = `${email.body}`;
      dateTime.innerHTML = `${email['timestamp']}`;
      
      
      archivedButton.innerHTML = 'Archive';
      
      
      
    
      parentDiv.appendChild(sender);
      parentDiv.appendChild(subject);
     
      parentDiv.appendChild(dateTime);
     
      parentDiv.classList.add('parent-div');
     
      
      if(!email.read){
         mainDiv.style.backgroundColor = 'white';
      }else{
         mainDiv.style.backgroundColor = 'lightgrey';
      }

      console.log(email.read);
      
      
      if(mailbox === "inbox" || mailbox === "archive"){
         //parentDiv.appendChild(img);
         console.log(mailbox)
      }

      if(mailbox === "archive"){
        archivedButton.innerHTML = 'Move to inbox';
      }
     
     

      parentDiv.addEventListener('click', () => {
        
        // Clear read-view div before each email is read.
        document.querySelector('#read-view').innerHTML = "";
       
        readEmail(email)
        
      })
      mainDiv.appendChild(parentDiv);
      

      archivedButton.addEventListener('click', () => {
        archive_email(email);
      })

      if(mailbox === "inbox" || mailbox === "archive"){
        //parentDiv.appendChild(img);
        mainDiv.appendChild(archivedButton);
        console.log(mailbox)
     }
     
     emailView.appendChild(mainDiv)
    })
 })
}

function sendEmail(e){
  // prevent form from submitting
  e.preventDefault();
  
  // selecting the DOM elements
  let recipients = document.querySelector('#compose-recipients');
  let subject = document.querySelector('#compose-subject');
  let body = document.querySelector('#compose-body')

  // Post email to the fetch API
  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
      recipients: recipients.value,
      subject: subject.value,
      body: body.value
    })
  })
  .then(response => response.json())
  .then(result => {
    if(result['error']){
      console.log(result)
    }else{
      load_mailbox('sent')
    }
  })
  .catch(err => console.log(err))

}


