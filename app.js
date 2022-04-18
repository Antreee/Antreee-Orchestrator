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
	type OrderDetail {
		_id: String
		orderId: String
		foodId: String
		quantity: Int
	}
	type Order {
		_id: String
		customerName: String
		customerPhoneNumber: String
		tableNumber: String
		totalPrice: Int
		bookingDate: String
		numberOfPeople: Int
		status: String
	}
	type FavouriteRestaurant {
		id: ID
		customerId: String
		restaurantId: String
	}
	type UserProfile {
		_id: String
		fullName: String
		email: String
		password: String
		phoneNumber: String
		profilePicture: String
		role: String
	}
	type Info {
		message: String
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
	type Query{
    restaurants(stringCoordinates: String): [Restaurant]
    restaurant(_id: ID!): Restaurant
    items: [Item]
    itemsByRestaurantId(_id: ID!): [Item]
    orderDetails(orderId: String!): [OrderDetail]
    orders(customerName: String!): [Order]
    favourites(customerId: String!): [FavouriteRestaurant]
    userProfile(_id: String!): UserProfile
    getRestaurantByAdmin: [Restaurant]
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
			orderDetails: OrderDetails
		): Info
		updateAvailability(available: String): Info
		login(email: String, password: String): MessageLogin
	}
`;
const resolvers = {
	Query: {
    restaurants: async (_, args) => {
      try {
        const { data: restaurants } = await axios({
          url: "http://localhost:3000/restaurants",
          method: "GET",
          headers: {
            coordinates: args.stringCoordinates,
          },
        });
        return restaurants;
      } catch (error) {
        console.log(error.response.data);
      }
    },
		restaurant: async (_, args) => {
			try {
				const { data: restaurant } = await axios({
					url: `http://localhost:3000/restaurants/${args._id}`,
					method: "GET",
				});
				return restaurant;
			} catch (error) {
				console.log(error.response.data);
			}
		},
		items: async () => {
			try {
				const { data: items } = await axios({
					url: "http://localhost:3000/items",
					method: "GET",
				});
				return items;
			} catch (error) {
				console.log(error.response.data);
			}
		},
		itemsByRestaurantId: async (_, args) => {
			try {
				console.log(args);
				const { data: itemsByRestaurantId } = await axios({
					url: `http://localhost:3000/restaurants/${args._id}/items`,
					method: "GET",
				});

				console.log("itemsByRestaurantId", itemsByRestaurantId);

				return itemsByRestaurantId.item;
			} catch (error) {
				console.log(error.response.data);
			}
		},
		orderDetails: async (_, args) => {
			try {
				const { data: orderDetails } = await axios({
					url: "http://localhost:3000/orderDetails",
					method: "GET",
					params: {
						orderId: args.orderId,
					},
				});
				return orderDetails;
			} catch (error) {
				console.log(error.response.data);
			}
		},
		orders: async (_, args) => {
			try {
				const { data: orders } = await axios({
					url: "http://localhost:3000/orders",
					method: "GET",
					params: {
						customerName: args.customerName,
					},
				});
				return orders;
			} catch (error) {
				console.log(error.response.data);
			}
		},
		favourites: async (_, args) => {
			try {
				const { data: favourites } = await axios({
					url: "http://localhost:3000/favouriteRestaurants",
					method: "GET",
					params: {
						customerId: args.customerId,
					},
				});
				return favourites;
			} catch (error) {
				console.log(error.response.data);
			}
		},
		userProfile: async (_, args) => {
			try {
				const { data: userProfile } = await axios({
					url: `http://localhost:3000/userProfiles/${args._id}`,
					method: "GET",
				});
				return userProfile;
			} catch (error) {
				console.log(error.response.data);
			}
		},
   getRestaurantByAdmin: async (_, args, context) => {
			try {
				console.log(context);
				const { data: restaurant } = await axios({
					url: `http://localhost:3000/restaurants/admin`,
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
	},
	Mutation: {
    createOrder: async (_, args) => {
      try {
        console.log(args);
        const {
          customerName,
          customerPhoneNumber,
          customerEmail,
          tableNumber,
          totalPrice,
          bookingDate,
          numberOfPeople,
          orderDetails,
        } = args;
        const { data: response } = await axios({
          url: "http://localhost:3000/customers/orders",
          method: "POST",
          data: {
            customerName,
            customerPhoneNumber,
            customerEmail,
            tableNumber,
            totalPrice,
            bookingDate,
            numberOfPeople,
            orderDetails: orderDetails.data,
          },
        });
        return { message: response };
      } catch (error) {
        console.log(error.response.data);
      }
    },
		login: async (_, args) => {
			try {
				const { email, password } = args;
				const { data: response } = await axios({
					url: "http://localhost:3000/admin/login",
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
				const { data: response } = await axios({
					url: `http://localhost:3000/restaurants/${args._id}`,
					method: "PATCH",
					data: {
						availability: args.availability,
					},
					headers: {
						access_token: context.access_token,
					},
				});
				return { message: response };
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
});

server.listen(PORT).then(({ url }) => {
	console.log(`🚀  Server ready at ${url}`);
});
