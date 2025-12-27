const amqp = require('amqplib');
const config = require('../../utils/config');

const ProducerService = {
  sendMessage: async (queue, message) => {
    try {
      console.log(`Mengirimkan pesan ke queue: ${queue}`);

      const connection = await amqp.connect(config.rabbitmq.server, {
        frameMax: 8192
      });

      const channel = await connection.createChannel();

      await channel.assertQueue(queue, {
        durable: true,
      });

      const sent = channel.sendToQueue(queue, Buffer.from(message), {
        persistent: true,
      });

      await channel.close();
      await connection.close();

      if (sent) {
        console.log('Pesan berhasil dikirim');
      } else {
        console.log('Gagal mengirim pesan');
      }
    } catch (error) {
      console.error('Koneksi RabbitMQ gagal:', error.message);
      throw new Error('Gagal mengirim pesan ke RabbitMQ.');
    }
  },
};

module.exports = ProducerService;
