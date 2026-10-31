function toUserResponse(user) {
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt ?? user.created_at,
  };
}

module.exports = {
  toUserResponse,
};