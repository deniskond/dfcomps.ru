import { WebSocket } from 'ws';
import * as http from 'http';
import { RoundView } from '../race/interfaces/views.iterface';
import { inspect } from 'util';

describe('testing connection', () => {
  const adminHeaders = {
    Cookie: 'login=admin; password=admin',
  };
  it('create competition', async () => {
    let resp = await fetch('http://localhost:4006/competitions', {
      headers: adminHeaders,
      method: 'POST',
    });
    expect(resp.status).toEqual(400);
    resp = await fetch('http://localhost:4006/competitions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ numBans: 2 }),
    });
    expect(resp.status).toEqual(403);
    resp = await fetch('http://localhost:4006/competitions', {
      method: 'POST',
      headers: {
        ...adminHeaders,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ numBans: 2 }),
    });
    expect(resp.status).toEqual(200);
    expect(await resp.json()).toEqual(expect.objectContaining({ id: expect.stringMatching('.*') }));
  });

  it('listing competition', async () => {
    let resp = await fetch('http://localhost:4006/competitions', {
      method: 'POST',
      headers: {
        ...adminHeaders,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ numBans: 2 }),
    });
    expect(resp.status).toEqual(200);
    const competitionId: string = (await resp.json()).id;
    // get list
    resp = await fetch('http://localhost:4006/competitions', { method: 'GET' });
    expect(resp.status).toEqual(200);
    expect(await resp.json()).toEqual(expect.arrayContaining([competitionId]));
    resp = await fetch('http://localhost:4006/competitions', { method: 'GET', headers: { ...adminHeaders } });
    expect(resp.status).toEqual(200);
    expect(await resp.json()).toEqual(expect.arrayContaining([competitionId]));
    // get exact
    resp = await fetch(`http://localhost:4006/competitions/${competitionId}`, { method: 'GET' });
    expect(resp.status).toEqual(200);
    expect(await resp.json()).toEqual(expect.objectContaining({ id: competitionId }));
    resp = await fetch(`http://localhost:4006/competitions/${competitionId}`, {
      method: 'GET',
      headers: { ...adminHeaders },
    });
    expect(resp.status).toEqual(200);
    expect(await resp.json()).toEqual(expect.objectContaining({ id: competitionId }));
  });
  it('adding players', async () => {
    let resp = await fetch('http://localhost:4006/competitions', {
      method: 'POST',
      headers: {
        ...adminHeaders,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ numBans: 2 }),
    });
    expect(resp.status).toEqual(200);
    const competitionId: string = (await resp.json()).id;
    // check errors
    resp = await fetch(`http://localhost:4006/competitions/${competitionId}/players`, { method: 'PUT' });
    expect(resp.status).toEqual(400);
    resp = await fetch(`http://localhost:4006/competitions/${competitionId}/players?nick=player`, { method: 'PUT' });
    expect(resp.status).toEqual(404);
    resp = await fetch(`http://localhost:4006/competitions/${competitionId}/players`, {
      method: 'PUT',
      headers: { ...adminHeaders },
    });
    expect(resp.status).toEqual(400);
    // success
    resp = await fetch(`http://localhost:4006/competitions/${competitionId}/players?nick=player`, {
      method: 'PUT',
      headers: { ...adminHeaders },
    });
    expect(resp.status).toEqual(200);
    resp = await fetch(`http://localhost:4006/competitions/${competitionId}/players?nick=player`, {
      method: 'PUT',
      headers: { ...adminHeaders },
    });
    expect(resp.status).toEqual(409);
    resp = await fetch(`http://localhost:4006/competitions/${competitionId}/players`, { method: 'GET' });
    expect(resp.status).toEqual(200);
    expect(await resp.json()).toEqual(expect.arrayContaining([expect.objectContaining({ playerName: 'player' })]));
  });
  it('adding maps', async () => {
    let resp = await fetch('http://localhost:4006/competitions', {
      method: 'POST',
      headers: {
        ...adminHeaders,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ numBans: 2 }),
    });
    expect(resp.status).toEqual(200);
    const competitionId: string = (await resp.json()).id;
    // check errors
    resp = await fetch(`http://localhost:4006/competitions/${competitionId}/maps`, { method: 'PUT' });
    expect(resp.status).toEqual(400);
    resp = await fetch(`http://localhost:4006/competitions/${competitionId}/maps?name=st1`, { method: 'PUT' });
    expect(resp.status).toEqual(404);
    resp = await fetch(`http://localhost:4006/competitions/${competitionId}/maps`, {
      method: 'PUT',
      headers: { ...adminHeaders },
    });
    expect(resp.status).toEqual(400);
    resp = await fetch(`http://localhost:4006/competitions/${competitionId}/maps?name=_____`, {
      method: 'PUT',
      headers: { ...adminHeaders },
    });
    expect(resp.status).toEqual(400);
    // success
    resp = await fetch(`http://localhost:4006/competitions/${competitionId}/maps?name=st1`, {
      method: 'PUT',
      headers: { ...adminHeaders },
    });
    expect(resp.status).toEqual(200);
    resp = await fetch(`http://localhost:4006/competitions/${competitionId}/maps`, { method: 'GET' });
    expect(resp.status).toEqual(200);
    expect(await resp.json()).toEqual(expect.arrayContaining([expect.objectContaining({ mapName: 'st1' })]));
  });
  it('starting competition', async () => {
    let resp = await fetch('http://localhost:4006/competitions', {
      method: 'POST',
      headers: {
        ...adminHeaders,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ numBans: 1 }),
    });
    expect(resp.status).toEqual(200);
    const competitionId: string = (await resp.json()).id;
    const players = [];
    for (let i = 0; i < 4; ++i) {
      players.push(`p${i}`);
      resp = await fetch(`http://localhost:4006/competitions/${competitionId}/players?nick=p${i}`, {
        method: 'PUT',
        headers: { ...adminHeaders },
      });
      expect(resp.status).toEqual(200);
    }
    const maplist = ['st1', 'st2', 'pornstar-bless', 'cityrocket', 'vorue-grind', '=53='];
    for (const i of maplist) {
      resp = await fetch(`http://localhost:4006/competitions/${competitionId}/maps?name=${encodeURI(i)}`, {
        method: 'PUT',
        headers: { ...adminHeaders },
      });
      expect(resp.status).toEqual(200);
    }
    // [TODO] add error handling checkers
    resp = await fetch(`http://localhost:4006/competitions/${competitionId}/start`, {
      method: 'POST',
      headers: { ...adminHeaders },
    });
    expect(resp.status).toEqual(200);
    expect(await resp.json()).toEqual(3);
    resp = await fetch(`http://localhost:4006/competitions/${competitionId}`, {
      method: 'GET',
      headers: { ...adminHeaders },
    });
    expect(resp.status).toEqual(200);
    expect(await resp.json()).toEqual(
      expect.objectContaining({
        id: competitionId,
        brackets: {
          rounds: [
            { players: [null, null] },
            { players: expect.arrayContaining([0, 2]) },
            { players: expect.arrayContaining([1, 3]) },
          ],
        },
        mapPool: maplist.map((i) => expect.objectContaining({ mapName: i })),
        players: players.map((i) => expect.objectContaining({ playerName: i })),
      }),
    );

    resp = await fetch(`http://localhost:4006/competitions/${competitionId}/rounds/1`, {
      method: 'POST',
      headers: { ...adminHeaders },
    });
    expect(resp.status).toEqual(200);
    const round = (await resp.json()) as RoundView & { tokens: { token: string }[] };
    const p0ws = new WebSocket(
      `ws://localhost:4006/bracket/${competitionId}/rounds/1?token=${encodeURI(round.tokens[0].token)}`,
    );
    const p1ws = new WebSocket(
      `ws://localhost:4006/bracket/${competitionId}/rounds/1?token=${encodeURI(round.tokens[1].token)}`,
    );
    const adminWs = new WebSocket(`ws://localhost:4006/bracket/${competitionId}/rounds/1`, { headers: adminHeaders });
    // [TODO] fix async logic to replace sleep
    await new Promise((r) => {
      p0ws.on('open', () => {
        r(null);
      });
    });
    await new Promise((r) => {
      p1ws.on('open', () => {
        r(null);
      });
    });
    await new Promise((r) => {
      adminWs.on('open', () => {
        r(null);
      });
    });
    const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    const recv = [];
    adminWs.on('message', (w) => {
      const msg = JSON.parse(w.toString('utf-8'));
      recv.push(msg);
    });
    p0ws.send(JSON.stringify({ action: 'Ban', mapIndex: 0 }));
    await sleep(10);
    p1ws.send(JSON.stringify({ action: 'Ban', mapIndex: 1 }));
    await sleep(10);
    p0ws.send(JSON.stringify({ action: 'Ban', mapIndex: 2 }));
    await sleep(10);
    adminWs.send(JSON.stringify({ action: 'Unban', mapIndex: 1 }));
    await sleep(10);
    adminWs.send(JSON.stringify({ action: 'Ban', mapIndex: 2 }));
    await sleep(10);
    p1ws.send(JSON.stringify({ action: 'Ban', mapIndex: 3 }));
    adminWs.send(JSON.stringify({ action: 'Start' }));
    adminWs.send(JSON.stringify({ action: 'Complete', winner: 0 }));
    await new Promise((resolve) => setTimeout(resolve, 2000));
    expect(recv).toEqual([
      { result: expect.objectContaining({ bans: {} }) },
      { result: expect.objectContaining({ bans: { 0: 0 } }) },
      { result: expect.objectContaining({ bans: { 0: 0, 1: 1 } }) },
      // { result: expect.objectContaining({ bans: { 0: 0, 1: 1, 2: 0 } }) },
      { result: expect.objectContaining({ bans: { 0: 0 } }) },
      { result: expect.objectContaining({ bans: { 0: 0, 2: 1 } }) },
      { result: expect.objectContaining({ stage: 'Running' }) },
      { result: expect.objectContaining({ stage: 'Completed' }) },
    ]);
    resp = await fetch(`http://localhost:4006/competitions/${competitionId}`);
    expect(resp.status).toEqual(200);
    const res = await resp.json();
    expect(res).toEqual(
      expect.objectContaining({
        brackets: {
          rounds: expect.arrayContaining([{ players: [0, null] }, expect.objectContaining({ winnerIndex: 0 })]),
        },
      }),
    );
  });
});

// creating competition
// curl -X POST -H "Content-Type: application/json" -d '{"numBans": 2}' http://localhost:4006/competitions          -> "You must be logged in to create competitions"
// curl -X POST -H "Cookie: login=admin; password=admin" http://localhost:4006/competitions                         -> CompetitionRules expected at body
// curl -X POST -H "Cookie: login=admin; password=admin" -H "Content-Type: application/json" -d '{"numBans": 2}' http://localhost:4006/competitions

// listing competitions
// curl -X GET http://localhost:4006/competitions
// ID=$(curl -X GET -H "Cookie: login=admin; password=admin" http://localhost:4006/competitions | jq -r '.[0]')
// curl -X GET "http://localhost:4006/competitions/$ID"
// curl -X GET -H "Cookie: login=admin; password=admin" "http://localhost:4006/competitions/$ID"

// adding players
// curl -X PUT -H "Cookie: login=admin; password=admin" "http://localhost:4006/competitions/$ID/players"            -> "Expected 'nick' query string parameter"
// curl -X PUT "http://localhost:4006/competitions/$ID/players?nick=rantrave"                                       -> "Competition with id='.*' is not found"
// curl -X PUT -H "Cookie: login=admin; password=admin" "http://localhost:4006/competitions/$ID/players?nick=rantrave"
// curl -X PUT -H "Cookie: login=admin; password=admin" "http://localhost:4006/competitions/$ID/players?nick=--w00deh--"
// curl -X PUT -H "Cookie: login=admin; password=admin" "http://localhost:4006/competitions/$ID/players?nick=n0sf"
// curl -X PUT -H "Cookie: login=admin; password=admin" "http://localhost:4006/competitions/$ID/players?nick=raven"

// adding maps
// curl -X PUT "http://localhost:4006/competitions/$ID/maps?name=st1"                                               -> "Competition with id='.*' is not found"
// curl -X PUT -H "Cookie: login=admin; password=admin" "http://localhost:4006/competitions/$ID/maps?name=_____"    -> "Map _____ is not found"
// curl -X PUT -H "Cookie: login=admin; password=admin" "http://localhost:4006/competitions/$ID/maps?name=st1"
