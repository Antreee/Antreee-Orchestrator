const { GraphQLString, GraphQLInt, GraphQLObjectType, GraphQLInputObjectType } = require("graphql");

const orderDetailType = new GraphQLObjectType({
  name: "OrderDetail",
  fields: {
    foodId: { type: GraphQLString },
    quantity: { type: GraphQLInt },
  },
});

const orderDetailInput = new GraphQLInputObjectType({
  name: "OrderDetailInput",
  fields: {
    foodId: { type: GraphQLString },
    quantity: { type: GraphQLInt },
  },
});
