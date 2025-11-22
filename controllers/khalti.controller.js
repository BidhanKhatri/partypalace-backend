export const khaltiController = async (req, res) => {
  const { token, amount, userId, bookingId } = req.body;

  try {
    const khaltiResponse = await axios.post(
      "https://khalti.com/api/v2/payment/verify/",
      {
        token: token,
        amount: amount,
      },
      {
        headers: {
          Authorization: "Key 0b9f9d88089949fb9a28ef700275df9b",
        },
      }
    );

    // Optional → store in MongoDB
    // await Payment.create({
    //     userId,
    //     bookingId,
    //     amount,
    //     status: "Success",
    //     payload: khaltiResponse.data
    // });

    res.json({
      success: true,
      message: "Payment verified successfully",
      data: khaltiResponse.data,
    });
  } catch (err) {
    console.log(err.response?.data);

    res.json({
      success: false,
      message: "Payment verification failed",
      error: err.response?.data,
    });
  }
};
