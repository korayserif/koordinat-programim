// netlify/functions/send-email.js

const nodemailer = require('nodemailer');

// process.env -> Netlify arayüzüne gireceğimiz GÜVENLİ değişkenler
const SENDER_EMAIL = process.env.SENDER_EMAIL;
const SENDER_APP_PASSWORD = process.env.SENDER_APP_PASSWORD;

exports.handler = async function(event, context) {
    // Sadece POST isteklerini kabul et
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        // HTML'den gönderilen e-posta adresini al
        const { email } = JSON.parse(event.body);
        
        // 6 haneli rastgele bir doğrulama kodu oluştur
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

        // Gmail'e bağlanmak için nodemailer'ı ayarla
        let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: SENDER_EMAIL,
                pass: SENDER_APP_PASSWORD,
            },
        });

        // E-postanın içeriğini hazırla
        await transporter.sendMail({
            from: `"Koordinat Dönüştürücü" <${SENDER_EMAIL}>`,
            to: email, // Alıcı
            subject: 'Doğrulama Kodunuz',
            html: `
                <h3>Merhaba,</h3>
                <p>Koordinat Dönüştürücü programına giriş için doğrulama kodunuz aşağıdadır:</p>
                <h2 style="color: #764ba2; font-size: 28px; letter-spacing: 3px;">${verificationCode}</h2>
                <hr>
                <p><small>Bu isteği siz yapmadıysanız, bu e-postayı görmezden gelin.</small></p>
            `,
        });

        // Her şey yolundaysa, HTML tarafına başarı mesajı ve kodu gönder
        return {
            statusCode: 200,
            body: JSON.stringify({ 
                success: true, 
                message: 'E-posta başarıyla gönderildi!',
                code: verificationCode // Bu kodu ön yüze gönderiyoruz ki karşılaştırma yapabilsin
            })
        };

    } catch (error) {
        console.error('E-posta gönderme hatası:', error);
        // Hata olursa, hatayı bildir
        return {
            statusCode: 500,
            body: JSON.stringify({ success: false, message: 'E-posta gönderilemedi.' })
        };
    }
};