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

const typeDefs = gql`
  type Restaurant {
    id: ID
    name: String
    logoUrl: String
    cuisine: [String]
    address: String
    coordinate: String
    contactNumber: String
    openingHours: String
    available: Boolean
    capacity: Int
    mainImagesUrl: [String]
    adminId: Int
  }
  type Item {
    id: ID
    restaurantId: Int
    name: String
    price: Int
    category: String
    imagesUrl: [String]
    description: String
    available: Boolean
  }
  type OrderDetail {
    id: ID
    orderId: Int
    foodId: Int
    quantity: Int
  }
  type Order {
    id: ID
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
    id: ID
    fullName: String
    email: String
    password: String
    phoneNumber: String
    profilePicture: String
    role: String
  }
  type Query {
    restaurants: [Restaurant]
    restaurant(id: ID!): Restaurant
    items: [Item]
    orderDetails(orderId: Int!): [OrderDetail]
    orders(customerName: String!): [Order]
    favourites(customerId: Int!): [FavouriteRestaurant]
    userProfile(id: ID!): UserProfile
  }
  type Mutation {
    createOrder(
      customerName: String
      customerPhoneNumber: String
      tableNumber: String
      totalPrice: Int
      bookingDate: String
      numberOfPeople: Int
      status: String
    ): Order
  }
`;
const resolvers = {
  Query: {
    restaurants: async () => {
      try {
        const { data: restaurants } = await axios({
          url: "http://localhost:3000/restaurants",
          method: "GET",
        });
        return restaurants;
      } catch (error) {
        console.log(error.response.data);
      }
    },
    restaurant: async (_, args) => {
      try {
        const { data: restaurant } = await axios({
          url: `http://localhost:3000/restaurants/${args.id}`,
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
          url: `http://localhost:3000/userProfiles/${args.id}`,
          method: "GET",
        });
        return userProfile;
      } catch (error) {
        console.log(error.response.data);
      }
    },
  },
  Mutation: {
    createOrder: async (_, args) => {
      try {
        const {
          customerName,
          customerPhoneNumber,
          tableNumber,
          totalPrice,
          bookingDate,
          numberOfPeople,
          status,
        } = args;

        const { data: orders } = await axios({
          url: "http://localhost:3000/orders",
          method: "POST",
          data: {
            customerName,
            customerPhoneNumber,
            tableNumber,
            totalPrice,
            bookingDate,
            numberOfPeople,
            status,
          },
        });
        return orders;
      } catch (error) {
        console.log(error.response.data);
      }
    },
  },
};

const server = new ApolloServer({ typeDefs, resolvers });

server.listen(PORT).then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});
