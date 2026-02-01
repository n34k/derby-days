import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY!);

interface PurchaseEmailParams {
    to: string;
    name: string;
    category: string;
    amount: number;
}

interface AdminPurchaseEmailParams {
    note?: string;
    name: string;
    category: string;
    amount: number;
}

const from = "Fresno State Derby Days <no-reply@derbydays.org>";

const email = "fresnoderbydays@gmail.com";

export async function sendAdminPurchaseEmail({ name, category, amount, note }: AdminPurchaseEmailParams) {
    let subject = "";
    let html = "";
    if (category === "donation") {
        subject = "New Donation!";
        html = `<p>${name} has donated <strong>$${amount.toFixed(2)}</strong></p><p>Note: ${note}</p>`;
    } else if (category === "ad") {
        subject = "New Ad Purchase!";
        html = `<p>${name} has bought an ad for <strong>$${amount.toFixed(2)}</strong></p>`;
    } else if (category === "shirt") return;

    console.log("Sending email", from);
    console.log("to: ", email);
    console.log("HTML: ", html);

    await resend.emails.send({
        from,
        to: email,
        subject,
        html,
    });
}

export async function sendPurchaseEmail({ to, name, category, amount }: PurchaseEmailParams) {
    let subject = "";
    let html = "";
    if (category === "donation") {
        subject = "Thank you for your donation to Valley Children's Hospital!";
        html = `
    <p>Hi ${name},</p>
    <p>Thank you so much for your generous donation of <strong>$${amount.toFixed(
        2,
    )}</strong> to Valley Children’s Hospital through Derby Days. Your support helps us make a real difference in the lives of the children and families we serve.</p>
    <p>You will be able to see you donation reflected in the live standings, as well as the donors page on our website.<p>
    <p>We truly appreciate your generosity.</p>
    <p>With gratitude,<br/>The Derby Days Team</p>
    `;
    } else if (category === "ad") {
        subject = "Thank you for your ad purchase – Derby Days";
        html = `
    <p>Hi ${name},</p>
    <p>Thank you for purchasing an ad through our Derby Days fundraiser. Your support means a lot to us and directly contributes to our efforts to raise money for Valley Children’s Hospital.</p>
    <p>To submit your ad, please email <strong>fresnoderbydays@gmail.com</strong> to send in your ad or if you have any questions.</p>
    <p>Best regards,<br/>The Derby Days Team</p>
    `;
    } else if (category === "shirt") {
        subject = "Your Derby Days shirt order is confirmed!";
        html = `
    <p>Hi ${name},</p>
    <p>Thank you for purchasing a Derby Days shirt! Your order has been received. Your shirt will be given to you Derby Darling when they come in.</p>
    <p>Your support helps us raise money for Valley Children’s Hospital — thank you for being part of this cause.</p>
    <p>Warmly,<br/>The Derby Days Team</p>
    `;
    }
    await resend.emails.send({
        from,
        to,
        subject,
        html,
    });
}

interface SignUpEmailParams {
    to: string;
}

export async function sendSignUpEmail({ to }: SignUpEmailParams) {
    const subject = "Create your Derby Days account";
    const html = `
    <p>Hi, ${to}</p>
    <p>You've been invited to create an account for Derby Days!</p>
    <p>Make sure to sign in with the account you are receiving this email with.</p>
    <p>Please make a Google Account with it as well if you haven't already Click the link below to get started:</p>
    <p><a href="${process.env.DOMAIN}/signin">Create your account</a></p>`;

    await resend.emails.send({
        from,
        to,
        subject,
        html,
    });
}
