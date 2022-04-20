if (process.env.NODE_ENV !== "production") require("dotenv").config();
const { ApolloServer, gql } = require("apollo-server");
const axios = require("axios");
const PORT = process.env.PORT || 4000;
// const Redis = require("ioredis");
// const redis = new Redis({
//   port: process.env.REDIS_PORT,
//   host: process.env.REDIS_HOST,
//   password: process.env.REDIS_PASSWORD,
// });

const context = async ({ req }) => {
	const access_token = await req.headers.authorization;
	return { access_token };
};

const typeDefs = gql`
	type Restaurant {
		_id: String
		name: String
		logoUrl: String
		cuisine: [String]
		address: String
		contactNumber: String
		location: Location
		available: Boolean
		capacity: Int
		mainImagesUrl: [String]
		adminId: String
		restaurantDistance: Float
	}
	type Location {
		type: String
		coordinates: [Float]
	}
	type Item {
		_id: String
		restaurantId: String
		name: String
		price: Int
		categoryItem: String
		imageUrl: String
		description: String
	}
	type Order {
		_id: String
		customerName: String
		customerPhoneNumber: String
		customerEmail: String
		tableNumber: String
		totalPrice: Int
		bookingDate: String
		numberOfPeople: Int
		restaurantId: String
		status: String
	}
	type CreateOrder {
		url: String
		orderId: String
	}
	type MessageLogin {
		status: String
		access_token: String
	}
	input InputDetail {
		itemId: String
		quantity: Int
	}
	input OrderDetails {
		data: [InputDetail]
	}
	type Info {
		message: String
	}
	type Query {
		restaurants(stringCoordinates: String, search: String): [Restaurant]
		restaurant(_id: ID!): Restaurant
		itemsByRestaurantId(_id: ID!): [Item]
		orderById(_id: ID!): Order
		getRestaurantByAdmin: [Restaurant]
		getOrdersByRestaurantId(_id: ID!): [Order]
		getBookedByRestaurantId(_id: ID!): [Order]
	}
	type Mutation {
		createOrder(
			customerName: String
			customerEmail: String
			customerPhoneNumber: String
			tableNumber: String
			totalPrice: Int
			bookingDate: String
			numberOfPeople: Int
			restaurantId: String
			orderDetails: OrderDetails
		): CreateOrder
		updateAvailability(_id: ID!, available: Boolean): Info
		login(email: String, password: String): MessageLogin
	}
`;
const resolvers = {
	Query: {
		restaurants: async (_, args) => {
			try {
				let { data: restaurants } = await axios({
					url: "https://server-nuerpay.herokuapp.com/restaurants",
					method: "GET",
					headers: {
						coordinates: args.stringCoordinates,
					},
				});
				if (args.search) {
					restaurants = restaurants.filter(
						(el) =>
							el.name.toLowerCase().indexOf(args.search.toLowerCase()) > -1
					);
				}
				return restaurants;
			} catch (error) {
				console.log(error.response.data);
			}
		},
		restaurant: async (_, args) => {
			try {
				const { data: restaurant } = await axios({
					url: `https://server-nuerpay.herokuapp.com/restaurants/${args._id}`,
					method: "GET",
				});
				return restaurant;
			} catch (error) {
				console.log(error.response.data);
			}
		},
		itemsByRestaurantId: async (_, args) => {
			try {
				const { data: itemsByRestaurantId } = await axios({
					url: `https://server-nuerpay.herokuapp.com/restaurants/${args._id}/items`,
					method: "GET",
				});
				return itemsByRestaurantId.item;
			} catch (error) {
				console.log(error.response.data);
			}
		},
		orderById: async (_, args) => {
			try {
				const { data: order } = await axios({
					url: `https://server-nuerpay.herokuapp.com/orders/${args._id}`,
					method: "GET",
				});
				return order;
			} catch (error) {
				console.log(error.response.data);
			}
		},
		getRestaurantByAdmin: async (_, args, context) => {
			try {
				const { data: restaurant } = await axios({
					url: `https://server-nuerpay.herokuapp.com/restaurants/admin`,
					method: "GET",
					headers: {
						access_token: context.access_token,
					},
				});

				return restaurant;
			} catch (error) {
				console.log(error.response.data);
			}
		},
		getOrdersByRestaurantId: async (_, args, context) => {
			try {
				const { data: getOrdersByRestaurantId } = await axios({
					url: `https://server-nuerpay.herokuapp.com/restaurants/${args._id}/orders`,
					method: "GET",
					headers: {
						access_token: context.access_token,
					},
				});

				return getOrdersByRestaurantId.orders;
			} catch (error) {
				console.log(error.response.data);
			}
		},
		getBookedByRestaurantId: async (_, args, context) => {
			try {
				const { data: getBookedByRestaurantId } = await axios({
					url: `https://server-nuerpay.herokuapp.com/restaurants/${args._id}/booked`,
					method: "GET",
					headers: {
						access_token: context.access_token,
					},
				});

				return getBookedByRestaurantId.booked;
			} catch (error) {
				console.log(error);
			}
		},
	},
	Mutation: {
		createOrder: async (_, args) => {
			console.log(args);
			try {
				const {
					customerName,
					customerPhoneNumber,
					customerEmail,
					tableNumber,
					totalPrice,
					bookingDate,
					numberOfPeople,
					restaurantId,
					orderDetails,
				} = args;
				const { data: response } = await axios({
					url: "https://server-nuerpay.herokuapp.com/customers/orders",
					method: "POST",
					data: {
						customerName,
						customerPhoneNumber,
						customerEmail,
						tableNumber,
						totalPrice,
						bookingDate,
						numberOfPeople,
						restaurantId,
						orderDetails: orderDetails ? orderDetails.data : null,
					},
				});
				return response;
			} catch (error) {
				console.log(error.response.data);
			}
		},

		login: async (_, args) => {
			try {
				const { email, password } = args;
				const { data: response } = await axios({
					url: "https://server-nuerpay.herokuapp.com/admin/login",
					method: "POST",
					data: {
						email,
						password,
					},
				});
				return { status: response.status, access_token: response.access_token };
			} catch (error) {
				throw error;
			}
		},
		updateAvailability: async (_, args, context) => {
			try {
				console.log(args);
				const { data: response } = await axios({
					url: `https://server-nuerpay.herokuapp.com/restaurants/${args._id}`,
					method: "PATCH",
					data: {
						available: args.available,
					},
					headers: {
						access_token: context.access_token,
					},
				});
				console.log(response);
				return { message: response.message };
			} catch (err) {
				console.log(err);
			}
		},
	},
};

const server = new ApolloServer({
	typeDefs,
	resolvers,
	context,
	playground: true,
	introspection: true,
});
server.listen(PORT).then(({ url }) => {
	console.log(`🚀  Server ready at ${url}`);
});
