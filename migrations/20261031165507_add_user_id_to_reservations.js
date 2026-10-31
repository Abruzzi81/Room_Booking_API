exports.up = async function (knex) {
  await knex.schema.alterTable('reservations', (table) => {
    table.integer('user_id')
      .unsigned()
      .nullable()
      .references('id')
      .inTable('users')
      .onDelete('RESTRICT');
  });

  const [{ count }] = await knex('reservations').count('* as count');

  if (Number(count) > 0) {
    const user = await knex('users')
      .select('id')
      .orderBy('id', 'asc')
      .first();

    if (!user) {
      throw new Error(
        'Nie można przypisać istniejących rezerwacji: tabela users jest pusta. Utwórz użytkownika i ponów migrację.'
      );
    }

    await knex('reservations')
      .whereNull('user_id')
      .update({ user_id: user.id });
  }

  await knex.schema.alterTable('reservations', (table) => {
    table.integer('user_id').unsigned().notNullable().alter();
    table.index(['user_id'], 'idx_reservations_user_id');
  });
};

exports.down = async function (knex) {
  await knex.schema.alterTable('reservations', (table) => {
    table.dropIndex(['user_id'], 'idx_reservations_user_id');
    table.dropForeign(['user_id']);
    table.dropColumn('user_id');
  });
};